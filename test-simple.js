// Playwrightの簡単なテスト
const { chromium } = require('playwright');

async function testPlaywright() {
  try {
    console.log('Playwrightのテストを開始...');
    
    // ヘッドレスブラウザを起動
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    console.log('ブラウザが起動しました');
    
    const page = await browser.newPage();
    await page.goto('https://example.com');
    
    const title = await page.title();
    console.log('ページタイトル:', title);
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'test-screenshot.png' });
    console.log('スクリーンショットを保存しました: test-screenshot.png');
    
    await browser.close();
    console.log('テスト完了!');
    
  } catch (error) {
    console.error('エラー:', error.message);
  }
}

testPlaywright();