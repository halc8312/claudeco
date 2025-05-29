import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { config, getAllUrls, websiteCategories } from './config';
import { ScreenshotMetadata } from './types';

/**
 * モックデータで動作を確認できるコレクター
 */
export class MockCollector {
  private metadata: ScreenshotMetadata[] = [];

  async initialize() {
    await fs.mkdir(config.outputDir.screenshots, { recursive: true });
    await fs.mkdir(config.outputDir.data, { recursive: true });
  }

  async collectMockData(limit: number = 10) {
    const urls = getAllUrls();
    const targetUrls = urls.slice(0, limit);

    console.log(`モックデータを${limit}件生成中...`);

    for (let i = 0; i < targetUrls.length; i++) {
      const url = targetUrls[i];
      const category = Object.entries(websiteCategories).find(
        ([_, urls]) => urls.includes(url)
      )?.[0] || 'other';

      // モックメタデータを生成
      const mockMetadata: ScreenshotMetadata = {
        id: randomUUID(),
        url,
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Website - ${new URL(url).hostname}`,
        description: `This is a mock description for ${url}`,
        timestamp: new Date().toISOString(),
        category,
        viewport: { width: 1920, height: 1080 },
        screenshot: {
          filename: `mock-${i}.png`,
          width: 1920,
          height: 1080,
          fileSize: Math.floor(Math.random() * 1000000) + 500000,
        },
        elements: {
          buttons: Math.floor(Math.random() * 20) + 5,
          links: Math.floor(Math.random() * 50) + 10,
          forms: Math.floor(Math.random() * 5) + 1,
          images: Math.floor(Math.random() * 30) + 5,
          inputs: Math.floor(Math.random() * 15) + 3,
        },
      };

      this.metadata.push(mockMetadata);
      console.log(`[${i + 1}/${targetUrls.length}] モックデータ生成: ${url}`);
    }

    await this.saveMetadata();
    await this.exportForFineTuning();
  }

  private async saveMetadata() {
    const metadataPath = path.join(config.outputDir.data, 'mock_metadata.jsonl');
    const lines = this.metadata.map(m => JSON.stringify(m));
    await fs.writeFile(metadataPath, lines.join('\n'));
    console.log(`\nメタデータを保存: ${metadataPath}`);
  }

  async exportForFineTuning() {
    const finetuningData = [];
    
    for (const meta of this.metadata) {
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
                  url: `mock-image-${meta.id}`  // モックURL
                }
              }
            ]
          },
          {
            role: "assistant",
            content: `On this ${meta.category} website (${meta.title}), I can see ${meta.elements?.buttons} buttons, ${meta.elements?.links} links, ${meta.elements?.forms} forms, and ${meta.elements?.inputs} input fields. The page appears to be ${meta.description}.`
          }
        ]
      });
    }
    
    const outputPath = path.join(config.outputDir.data, 'mock_finetuning_data.jsonl');
    const lines = finetuningData.map(d => JSON.stringify(d));
    await fs.writeFile(outputPath, lines.join('\n'));
    
    console.log(`\nファインチューニングデータを保存: ${outputPath}`);
    console.log(`トレーニングデータ数: ${finetuningData.length}`);
    
    // サンプルを表示
    console.log('\n=== サンプルデータ ===');
    console.log(JSON.stringify(finetuningData[0], null, 2));
  }
}