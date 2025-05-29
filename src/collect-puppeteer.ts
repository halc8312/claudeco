import * as fs from 'fs';
import * as path from 'path';
import puppeteer, { Browser } from 'puppeteer';
import sharp from 'sharp';
import axios from 'axios';
import pLimit from 'p-limit';

// Configuration
const CONFIG = {
  screenshotWidth: 1024,
  screenshotHeight: 768,
  jpegQuality: 80,
  outputDir: './dataset',
  metadataFile: './dataset/metadata.jsonl',
  concurrentLimit: 3,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 2000
};

// Define metadata structure
interface WebsiteMetadata {
  id: string;
  url: string;
  title: string;
  category: string;
  screenshot_filename: string;
  viewport: {
    width: number;
    height: number;
  };
  timestamp: string;
  page_type: string;
  has_forms: boolean;
  has_buttons: boolean;
  has_links: boolean;
  dominant_colors?: string[];
  text_content_sample: string;
}

// Website categories and URLs
const WEBSITE_CATEGORIES = {
  'ecommerce': [
    'https://www.amazon.com',
    'https://www.ebay.com',
    'https://www.etsy.com',
    'https://www.shopify.com',
    'https://www.target.com'
  ],
  'news': [
    'https://www.cnn.com',
    'https://www.bbc.com',
    'https://www.reuters.com',
    'https://www.theguardian.com',
    'https://www.nytimes.com'
  ],
  'social': [
    'https://www.reddit.com',
    'https://www.linkedin.com',
    'https://www.pinterest.com',
    'https://www.tumblr.com',
    'https://www.instagram.com'
  ],
  'tech': [
    'https://github.com',
    'https://stackoverflow.com',
    'https://www.hackerrank.com',
    'https://dev.to',
    'https://medium.com'
  ],
  'education': [
    'https://www.coursera.org',
    'https://www.khanacademy.org',
    'https://www.edx.org',
    'https://www.udemy.com',
    'https://www.codecademy.com'
  ],
  'entertainment': [
    'https://www.youtube.com',
    'https://www.netflix.com',
    'https://www.spotify.com',
    'https://www.twitch.tv',
    'https://www.imdb.com'
  ],
  'finance': [
    'https://www.paypal.com',
    'https://www.chase.com',
    'https://www.mint.com',
    'https://www.robinhood.com',
    'https://www.coinbase.com'
  ],
  'travel': [
    'https://www.booking.com',
    'https://www.airbnb.com',
    'https://www.expedia.com',
    'https://www.tripadvisor.com',
    'https://www.kayak.com'
  ],
  'productivity': [
    'https://www.notion.so',
    'https://www.trello.com',
    'https://www.slack.com',
    'https://www.asana.com',
    'https://www.monday.com'
  ],
  'government': [
    'https://www.usa.gov',
    'https://www.irs.gov',
    'https://www.cdc.gov',
    'https://www.nasa.gov',
    'https://www.weather.gov'
  ]
};

// Utility function to generate unique ID
function generateId(): string {
  return `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Utility function to ensure directory exists
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Utility function to wait
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Process single website with retry logic
async function processWebsite(
  browser: Browser,
  url: string,
  category: string,
  attempt: number = 1
): Promise<WebsiteMetadata | null> {
  const page = await browser.newPage();
  
  try {
    // Set viewport
    await page.setViewport({
      width: CONFIG.screenshotWidth,
      height: CONFIG.screenshotHeight
    });

    // Navigate to URL with timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout
    });

    // Wait a bit for dynamic content
    await wait(2000);

    // Generate metadata
    const id = generateId();
    const screenshotFilename = `${id}.jpg`;
    const screenshotPath = path.join(CONFIG.outputDir, screenshotFilename);

    // Take screenshot
    const screenshotBuffer = await page.screenshot({
      type: 'jpeg',
      quality: CONFIG.jpegQuality,
      fullPage: false
    });

    // Save screenshot
    await sharp(screenshotBuffer)
      .resize(CONFIG.screenshotWidth, CONFIG.screenshotHeight, {
        fit: 'cover',
        position: 'top'
      })
      .jpeg({ quality: CONFIG.jpegQuality })
      .toFile(screenshotPath);

    // Extract page information
    const pageInfo = await page.evaluate(() => {
      const getTextSample = () => {
        const textNodes = document.body.innerText || '';
        return textNodes.substring(0, 500).replace(/\n+/g, ' ').trim();
      };

      return {
        title: document.title || 'Untitled',
        hasForm: document.querySelectorAll('form').length > 0,
        hasButtons: document.querySelectorAll('button, input[type="button"], input[type="submit"]').length > 0,
        hasLinks: document.querySelectorAll('a[href]').length > 0,
        textSample: getTextSample()
      };
    });

    // Determine page type
    const pageType = await page.evaluate(() => {
      if (document.querySelector('form[action*="login"], form[action*="signin"]')) return 'login';
      if (document.querySelector('form[action*="search"]')) return 'search';
      if (document.querySelector('.product, .item, [class*="product"]')) return 'product_listing';
      if (document.querySelector('article, .article, [class*="article"]')) return 'article';
      if (document.querySelector('video, .video-player')) return 'video';
      return 'general';
    });

    // Create metadata
    const metadata: WebsiteMetadata = {
      id,
      url,
      title: pageInfo.title,
      category,
      screenshot_filename: screenshotFilename,
      viewport: {
        width: CONFIG.screenshotWidth,
        height: CONFIG.screenshotHeight
      },
      timestamp: new Date().toISOString(),
      page_type: pageType,
      has_forms: pageInfo.hasForm,
      has_buttons: pageInfo.hasButtons,
      has_links: pageInfo.hasLinks,
      text_content_sample: pageInfo.textSample
    };

    console.log(`✓ Captured: ${url} (${category})`);
    return metadata;

  } catch (error) {
    console.error(`✗ Failed to capture ${url}:`, error instanceof Error ? error.message : String(error));
    
    if (attempt < CONFIG.retryAttempts) {
      console.log(`  Retrying... (attempt ${attempt + 1}/${CONFIG.retryAttempts})`);
      await wait(CONFIG.retryDelay);
      return processWebsite(browser, url, category, attempt + 1);
    }
    
    return null;
  } finally {
    await page.close();
  }
}

// Main collection function
async function collectScreenshots(targetCount: number = 1000): Promise<void> {
  console.log(`Starting screenshot collection (target: ${targetCount} screenshots)...`);
  
  // Setup output directory
  ensureDirectoryExists(CONFIG.outputDir);
  
  // Prepare URLs with categories
  const urlsWithCategories: Array<{url: string, category: string}> = [];
  for (const [category, urls] of Object.entries(WEBSITE_CATEGORIES)) {
    for (const url of urls) {
      urlsWithCategories.push({ url, category });
    }
  }
  
  // Shuffle for variety
  urlsWithCategories.sort(() => Math.random() - 0.5);
  
  // Launch browser with minimal dependencies
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  });
  
  const limit = pLimit(CONFIG.concurrentLimit);
  const metadataList: WebsiteMetadata[] = [];
  
  try {
    // Process websites
    const tasks = urlsWithCategories.slice(0, targetCount).map(({ url, category }) =>
      limit(async () => {
        const metadata = await processWebsite(browser, url, category);
        if (metadata) {
          metadataList.push(metadata);
        }
      })
    );
    
    await Promise.all(tasks);
    
    // Save metadata
    const metadataContent = metadataList
      .map(metadata => JSON.stringify(metadata))
      .join('\n');
    
    fs.writeFileSync(CONFIG.metadataFile, metadataContent);
    
    console.log(`\n✓ Collection complete!`);
    console.log(`  Total screenshots: ${metadataList.length}`);
    console.log(`  Metadata saved to: ${CONFIG.metadataFile}`);
    console.log(`  Screenshots saved to: ${CONFIG.outputDir}/`);
    
  } finally {
    await browser.close();
  }
}

// Run if executed directly
if (require.main === module) {
  const targetCount = parseInt(process.argv[2]) || 50;
  collectScreenshots(targetCount).catch(console.error);
}

export { collectScreenshots, WebsiteMetadata };