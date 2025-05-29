import { chromium, Browser, Page } from 'playwright';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { config } from './config';
import { ScreenshotMetadata } from './types';

export class ScreenshotCapture {
  private browser: Browser | null = null;

  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async captureScreenshot(url: string, category: string): Promise<ScreenshotMetadata | null> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    const metadata: Partial<ScreenshotMetadata> = {
      id: randomUUID(),
      url,
      category,
      timestamp: new Date().toISOString(),
    };

    try {
      // ビューポート設定
      await page.setViewportSize({ width: 1920, height: 1080 });
      metadata.viewport = { width: 1920, height: 1080 };

      // ページに移動
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: config.timeout,
      });

      // タイトルと説明を取得
      metadata.title = await page.title();
      
      const description = await page.$eval('meta[name="description"]', 
        (el) => el.getAttribute('content')
      ).catch(() => null);
      if (description) {
        metadata.description = description;
      }

      // ページ要素をカウント
      metadata.elements = {
        buttons: await page.locator('button').count(),
        links: await page.locator('a').count(),
        forms: await page.locator('form').count(),
        images: await page.locator('img').count(),
        inputs: await page.locator('input, textarea, select').count(),
      };

      // スクリーンショットを撮影
      const screenshotBuffer = await page.screenshot({
        fullPage: config.screenshot.fullPage,
      });

      // 画像をリサイズして保存
      const filename = `${metadata.id}.png`;
      const filepath = path.join(config.outputDir.screenshots, filename);
      
      const processedImage = sharp(screenshotBuffer);
      const imageMetadata = await processedImage.metadata();
      
      // 最大解像度に合わせてリサイズ
      if (imageMetadata.width! > config.screenshot.maxWidth || 
          imageMetadata.height! > config.screenshot.maxHeight) {
        processedImage.resize(config.screenshot.maxWidth, config.screenshot.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      const outputBuffer = await processedImage
        .png({ quality: config.screenshot.quality })
        .toBuffer();

      await fs.writeFile(filepath, outputBuffer);

      // ファイル情報を更新
      const finalMetadata = await sharp(outputBuffer).metadata();
      metadata.screenshot = {
        filename,
        width: finalMetadata.width!,
        height: finalMetadata.height!,
        fileSize: outputBuffer.length,
      };

      await page.close();
      return metadata as ScreenshotMetadata;

    } catch (error) {
      await page.close();
      console.error(`Error capturing ${url}:`, error);
      metadata.error = error instanceof Error ? error.message : 'Unknown error';
      return metadata as ScreenshotMetadata;
    }
  }
}