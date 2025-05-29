import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { io } from '../index';
import { websiteCategories } from '../config/websites';

export interface CollectionStatus {
  jobId: string;
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
  screenshots: ScreenshotMetadata[];
}

export interface ScreenshotMetadata {
  id: string;
  url: string;
  title: string;
  category: string;
  filename: string;
  timestamp: string;
  error?: string;
}

export class ScreenshotCollector {
  private jobId: string;
  private apiKey?: string;
  private status: CollectionStatus;
  private uploadsDir: string;

  constructor(jobId: string, apiKey?: string) {
    this.jobId = jobId;
    this.apiKey = apiKey;
    this.uploadsDir = path.join(__dirname, '../../uploads', jobId);
    this.status = {
      jobId,
      total: 0,
      completed: 0,
      failed: 0,
      inProgress: false,
      screenshots: []
    };
  }

  async startCollection(customUrls: string[], count: number) {
    this.status.inProgress = true;
    this.emitStatus();

    try {
      // Create uploads directory
      await fs.mkdir(this.uploadsDir, { recursive: true });

      // Get URLs
      const urls = customUrls.length > 0 ? customUrls : this.getDefaultUrls();
      const targetUrls = urls.slice(0, count);
      this.status.total = targetUrls.length;

      // Process URLs
      for (let i = 0; i < targetUrls.length; i++) {
        await this.processUrl(targetUrls[i], i);
        this.emitStatus();
      }

      // Save metadata
      await this.saveMetadata();
    } catch (error) {
      console.error('Collection error:', error);
    } finally {
      this.status.inProgress = false;
      this.emitStatus();
    }
  }

  private async processUrl(url: string, index: number) {
    try {
      const category = this.getCategoryForUrl(url);
      const filename = `screenshot_${index}.jpg`;
      const filepath = path.join(this.uploadsDir, filename);

      // Get screenshot
      const screenshot = await this.getScreenshot(url);
      await fs.writeFile(filepath, screenshot);

      // Create metadata
      const metadata: ScreenshotMetadata = {
        id: `${this.jobId}_${index}`,
        url,
        title: new URL(url).hostname,
        category,
        filename,
        timestamp: new Date().toISOString()
      };

      this.status.screenshots.push(metadata);
      this.status.completed++;
    } catch (error) {
      this.status.failed++;
      console.error(`Failed to process ${url}:`, error);
    }
  }

  private async getScreenshot(url: string): Promise<Buffer> {
    if (this.apiKey) {
      // Use real screenshot API
      try {
        const apiUrl = `http://api.screenshotlayer.com/api/capture`;
        const response = await axios.get(apiUrl, {
          params: {
            access_key: this.apiKey,
            url: url,
            viewport: '1024x768',
            format: 'JPG',
            width: 1024
          },
          responseType: 'arraybuffer',
          timeout: 30000
        });
        return Buffer.from(response.data);
      } catch (error) {
        console.error('Screenshot API error:', error);
        return this.generatePlaceholder(url);
      }
    } else {
      // Generate placeholder
      return this.generatePlaceholder(url);
    }
  }

  private async generatePlaceholder(url: string): Promise<Buffer> {
    const svg = `
      <svg width="1024" height="768" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="24" fill="#333">
          Screenshot Placeholder
        </text>
        <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
          ${url}
        </text>
        <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="14" fill="#999">
          1024x768
        </text>
      </svg>
    `;

    return sharp(Buffer.from(svg))
      .resize(1024, 768)
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  private getDefaultUrls(): string[] {
    return Object.values(websiteCategories).flat();
  }

  private getCategoryForUrl(url: string): string {
    for (const [category, urls] of Object.entries(websiteCategories)) {
      if (urls.includes(url)) {
        return category;
      }
    }
    return 'other';
  }

  private async saveMetadata() {
    const metadataPath = path.join(this.uploadsDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(this.status.screenshots, null, 2));
  }

  private emitStatus() {
    io.emit(`job-status-${this.jobId}`, this.status);
  }

  getStatus(): CollectionStatus {
    return this.status;
  }
}