export const config = {
  // スクリーンショット設定
  screenshot: {
    maxWidth: 2048,
    maxHeight: 2048,
    format: 'png' as const,
    quality: 90,
    fullPage: true,
  },
  
  // 並行処理設定
  concurrency: 1,
  
  // タイムアウト設定
  timeout: 30000,
  
  // 出力ディレクトリ
  outputDir: {
    screenshots: './screenshots',
    data: './data',
  },
  
  // リトライ設定
  retry: {
    attempts: 3,
    delay: 1000,
  },
};

export const websiteCategories = {
  'ecommerce': [
    'https://www.amazon.com',
    'https://www.ebay.com',
    'https://www.etsy.com',
    'https://www.walmart.com',
    'https://www.target.com',
    'https://www.aliexpress.com',
    'https://www.mercadolibre.com',
    'https://www.rakuten.co.jp',
  ],
  'news': [
    'https://www.bbc.com',
    'https://www.cnn.com',
    'https://www.reuters.com',
    'https://www.nytimes.com',
    'https://www.theguardian.com',
    'https://www.washingtonpost.com',
    'https://www.asahi.com',
    'https://www.lemonde.fr',
  ],
  'social': [
    'https://www.reddit.com',
    'https://www.linkedin.com',
    'https://www.pinterest.com',
    'https://www.tumblr.com',
    'https://www.medium.com',
  ],
  'tech': [
    'https://github.com',
    'https://stackoverflow.com',
    'https://www.techcrunch.com',
    'https://www.theverge.com',
    'https://arstechnica.com',
    'https://www.wired.com',
    'https://news.ycombinator.com',
  ],
  'education': [
    'https://www.khanacademy.org',
    'https://www.coursera.org',
    'https://www.edx.org',
    'https://www.udemy.com',
    'https://www.mit.edu',
    'https://www.stanford.edu',
  ],
  'entertainment': [
    'https://www.youtube.com',
    'https://www.netflix.com',
    'https://www.spotify.com',
    'https://www.twitch.tv',
    'https://www.imdb.com',
  ],
  'travel': [
    'https://www.booking.com',
    'https://www.airbnb.com',
    'https://www.expedia.com',
    'https://www.tripadvisor.com',
    'https://www.hotels.com',
  ],
  'finance': [
    'https://www.paypal.com',
    'https://www.chase.com',
    'https://www.bankofamerica.com',
    'https://www.coinbase.com',
    'https://www.bloomberg.com',
  ],
  'government': [
    'https://www.gov.uk',
    'https://www.usa.gov',
    'https://www.canada.ca',
    'https://www.australia.gov.au',
  ],
  'health': [
    'https://www.webmd.com',
    'https://www.mayoclinic.org',
    'https://www.nih.gov',
    'https://www.who.int',
  ],
};

// すべてのURLを取得
export function getAllUrls(): string[] {
  return Object.values(websiteCategories).flat();
}