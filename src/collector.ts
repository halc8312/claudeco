import pLimit from 'p-limit';
import * as fs from 'fs/promises';
import * as path from 'path';
import { config, getAllUrls, websiteCategories } from './config';
import { ScreenshotCapture } from './screenshot';
import { ScreenshotMetadata, CollectionProgress } from './types';

export class WebsiteCollector {
  private screenshotCapture: ScreenshotCapture;
  private progress: CollectionProgress = {
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: 0,
  };
  private metadata: ScreenshotMetadata[] = [];

  constructor() {
    this.screenshotCapture = new ScreenshotCapture();
  }

  async initialize() {
    // 出力ディレクトリを作成
    await fs.mkdir(config.outputDir.screenshots, { recursive: true });
    await fs.mkdir(config.outputDir.data, { recursive: true });
    
    await this.screenshotCapture.initialize();
  }

  async collectAll(limit?: number) {
    const urls = getAllUrls();
    const targetUrls = limit ? urls.slice(0, limit) : urls;
    this.progress.total = targetUrls.length;

    console.log(`Starting collection of ${targetUrls.length} websites...`);

    const limiter = pLimit(config.concurrency);
    
    const tasks = targetUrls.map((url, index) => {
      // カテゴリを特定
      const category = Object.entries(websiteCategories).find(
        ([_, urls]) => urls.includes(url)
      )?.[0] || 'other';

      return limiter(async () => {
        this.progress.inProgress++;
        console.log(`[${index + 1}/${targetUrls.length}] Processing ${url}...`);
        
        try {
          const result = await this.retry(
            () => this.screenshotCapture.captureScreenshot(url, category),
            config.retry.attempts
          );
          
          if (result && !result.error) {
            this.metadata.push(result);
            this.progress.completed++;
            console.log(`✓ Completed: ${url}`);
          } else {
            this.progress.failed++;
            console.log(`✗ Failed: ${url} - ${result?.error}`);
          }
        } catch (error) {
          this.progress.failed++;
          console.error(`✗ Failed: ${url} - ${error}`);
        } finally {
          this.progress.inProgress--;
        }
      });
    });

    await Promise.all(tasks);
    await this.saveMetadata();
    await this.screenshotCapture.close();

    console.log('\nCollection complete!');
    console.log(`Total: ${this.progress.total}`);
    console.log(`Completed: ${this.progress.completed}`);
    console.log(`Failed: ${this.progress.failed}`);
  }

  private async retry<T>(fn: () => Promise<T>, attempts: number): Promise<T | null> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === attempts - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, config.retry.delay * (i + 1)));
      }
    }
    return null;
  }

  private async saveMetadata() {
    const metadataPath = path.join(config.outputDir.data, 'metadata.jsonl');
    const lines = this.metadata
      .filter(m => !m.error)
      .map(m => JSON.stringify(m));
    
    await fs.writeFile(metadataPath, lines.join('\n'));
    console.log(`\nMetadata saved to ${metadataPath}`);
  }

  getProgress(): CollectionProgress {
    return { ...this.progress };
  }

  async exportForFineTuning() {
    const validMetadata = this.metadata.filter(m => !m.error);
    const finetuningData = [];
    
    for (const meta of validMetadata) {
      // GPT-4o Visionファインチューニング用のフォーマット
      finetuningData.push({
        messages: [
          {
            role: "system",
            content: "You are a web automation assistant that can interact with web pages."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "What elements can you see on this webpage? Please identify clickable elements."
              },
              {
                type: "image_url",
                image_url: {
                  url: `file://${path.join(config.outputDir.screenshots, meta.screenshot.filename)}`
                }
              }
            ]
          },
          {
            role: "assistant",
            content: `On this ${meta.category} website (${meta.title}), I can see ${meta.elements?.buttons} buttons, ${meta.elements?.links} links, ${meta.elements?.forms} forms, and ${meta.elements?.inputs} input fields. The page appears to be ${meta.description || 'a web interface'}.`
          }
        ]
      });
    }
    
    const outputPath = path.join(config.outputDir.data, 'finetuning_data.jsonl');
    const lines = finetuningData.map(d => JSON.stringify(d));
    await fs.writeFile(outputPath, lines.join('\n'));
    
    console.log(`\nFine-tuning data exported to ${outputPath}`);
    console.log(`Total training examples: ${finetuningData.length}`);
  }
}