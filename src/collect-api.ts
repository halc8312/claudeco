import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import pLimit from 'p-limit';

// Configuration
const CONFIG = {
  screenshotWidth: 1024,
  screenshotHeight: 768,
  outputDir: './dataset',
  metadataFile: './dataset/metadata.jsonl',
  concurrentLimit: 3,
  timeout: 30000,
  screenshotApiUrl: 'https://api.screenshotone.com/take', // Free tier available
  // Alternative: https://api.apiflash.com/v1/urltoimage
  // Alternative: https://shot.screenshotapi.net/screenshot
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
  text_content_sample?: string;
}

// Website categories and URLs (same as before)
const WEBSITE_CATEGORIES = {
  'ecommerce': [
    'https://www.amazon.com',
    'https://www.ebay.com',
    'https://www.etsy.com',
    'https://www.walmart.com',
    'https://www.aliexpress.com'
  ],
  'news': [
    'https://www.cnn.com',
    'https://www.bbc.com',
    'https://www.reuters.com',
    'https://www.apnews.com',
    'https://www.bloomberg.com'
  ],
  'education': [
    'https://www.wikipedia.org',
    'https://www.khanacademy.org',
    'https://www.ted.com',
    'https://www.coursera.org',
    'https://www.edx.org'
  ],
  'social': [
    'https://www.reddit.com',
    'https://www.quora.com',
    'https://www.medium.com',
    'https://www.discord.com',
    'https://www.slack.com'
  ],
  'tech': [
    'https://github.com',
    'https://stackoverflow.com',
    'https://www.producthunt.com',
    'https://news.ycombinator.com',
    'https://www.techcrunch.com'
  ],
  'entertainment': [
    'https://www.youtube.com',
    'https://www.twitch.tv',
    'https://www.spotify.com',
    'https://www.netflix.com',
    'https://www.hulu.com'
  ],
  'tools': [
    'https://www.google.com',
    'https://www.dropbox.com',
    'https://www.notion.so',
    'https://www.figma.com',
    'https://www.canva.com'
  ],
  'finance': [
    'https://www.paypal.com',
    'https://www.stripe.com',
    'https://www.coinbase.com',
    'https://www.robinhood.com',
    'https://www.venmo.com'
  ],
  'health': [
    'https://www.webmd.com',
    'https://www.mayoclinic.org',
    'https://www.healthline.com',
    'https://www.nih.gov',
    'https://www.who.int'
  ],
  'travel': [
    'https://www.booking.com',
    'https://www.airbnb.com',
    'https://www.tripadvisor.com',
    'https://www.expedia.com',
    'https://www.hotels.com'
  ]
};

// Mock screenshot service using placeholder images
async function getMockScreenshot(url: string, width: number, height: number): Promise<Buffer> {
  // Use a screenshot service API or generate placeholder
  // For demo, we'll create a placeholder image with URL text
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="24" fill="#333">
        Screenshot Placeholder
      </text>
      <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
        ${url}
      </text>
      <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="14" fill="#999">
        ${width}x${height}
      </text>
    </svg>
  `;
  
  return sharp(Buffer.from(svg))
    .resize(width, height)
    .jpeg({ quality: 80 })
    .toBuffer();
}

// Alternative: Use a free screenshot API
async function getScreenshotFromAPI(url: string, width: number, height: number): Promise<Buffer | null> {
  try {
    // Example using screenshotlayer API (requires free API key)
    const apiKey = process.env.SCREENSHOT_API_KEY || '';
    if (!apiKey) {
      console.log('No API key found, using placeholder images');
      return getMockScreenshot(url, width, height);
    }
    
    const apiUrl = `http://api.screenshotlayer.com/api/capture`;
    const params = {
      access_key: apiKey,
      url: url,
      viewport: `${width}x${height}`,
      format: 'JPG',
      width: width
    };
    
    const response = await axios.get(apiUrl, {
      params,
      responseType: 'arraybuffer',
      timeout: CONFIG.timeout
    });
    
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Screenshot API error:', error instanceof Error ? error.message : String(error));
    return getMockScreenshot(url, width, height);
  }
}

// Utility functions
function generateId(): string {
  return `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Determine page type from URL
function inferPageType(url: string): string {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('login') || urlLower.includes('signin')) return 'login';
  if (urlLower.includes('search')) return 'search';
  if (urlLower.includes('product') || urlLower.includes('item')) return 'product';
  if (urlLower.includes('article') || urlLower.includes('post')) return 'article';
  if (urlLower.includes('video') || urlLower.includes('watch')) return 'video';
  if (urlLower.includes('checkout') || urlLower.includes('cart')) return 'checkout';
  return 'general';
}

// Process single website
async function processWebsite(
  url: string,
  category: string
): Promise<WebsiteMetadata | null> {
  try {
    console.log(`Processing: ${url}`);
    
    // Generate metadata
    const id = generateId();
    const screenshotFilename = `${id}.jpg`;
    const screenshotPath = path.join(CONFIG.outputDir, screenshotFilename);
    
    // Get screenshot
    const screenshotBuffer = await getScreenshotFromAPI(
      url,
      CONFIG.screenshotWidth,
      CONFIG.screenshotHeight
    );
    
    if (!screenshotBuffer) {
      throw new Error('Failed to get screenshot');
    }
    
    // Save screenshot
    await fs.promises.writeFile(screenshotPath, screenshotBuffer);
    
    // Extract domain for title
    const domain = new URL(url).hostname;
    
    // Create metadata
    const metadata: WebsiteMetadata = {
      id,
      url,
      title: domain,
      category,
      screenshot_filename: screenshotFilename,
      viewport: {
        width: CONFIG.screenshotWidth,
        height: CONFIG.screenshotHeight
      },
      timestamp: new Date().toISOString(),
      page_type: inferPageType(url)
    };
    
    console.log(`✓ Captured: ${url} (${category})`);
    return metadata;
    
  } catch (error) {
    console.error(`✗ Failed to capture ${url}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

// Main collection function
async function collectScreenshots(targetCount: number = 50): Promise<void> {
  console.log(`Starting screenshot collection (target: ${targetCount} screenshots)...`);
  console.log(`Note: Using API-based or placeholder screenshots`);
  
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
  
  const limit = pLimit(CONFIG.concurrentLimit);
  const metadataList: WebsiteMetadata[] = [];
  
  // Process websites
  const tasks = urlsWithCategories.slice(0, targetCount).map(({ url, category }) =>
    limit(async () => {
      const metadata = await processWebsite(url, category);
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
  
  // Instructions for using real screenshots
  console.log(`\n📌 To use real screenshots instead of placeholders:`);
  console.log(`  1. Sign up for a free API key at:`);
  console.log(`     - https://screenshotlayer.com (1000 free/month)`);
  console.log(`     - https://apiflash.com (100 free/month)`);
  console.log(`     - https://screenshotapi.net (100 free/month)`);
  console.log(`  2. Set environment variable: export SCREENSHOT_API_KEY=your_key`);
  console.log(`  3. Or use a cloud service with Playwright/Puppeteer pre-installed`);
}

// Run if executed directly
if (require.main === module) {
  const targetCount = parseInt(process.argv[2]) || 10;
  collectScreenshots(targetCount).catch(console.error);
}

export { collectScreenshots, WebsiteMetadata };