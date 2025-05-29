import { Router, Request, Response } from 'express';
import { ScreenshotCollector } from '../services/screenshotCollector';
import { generateFineTuningData } from '../services/dataProcessor';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

const router = Router();
const collectors = new Map<string, ScreenshotCollector>();

// Start new collection job
router.post('/collect', async (req: Request, res: Response) => {
  try {
    const { urls, count, apiKey } = req.body;
    const jobId = Date.now().toString();
    
    const collector = new ScreenshotCollector(jobId, apiKey);
    collectors.set(jobId, collector);
    
    // Start collection in background
    collector.startCollection(urls || [], count || 10);
    
    res.json({ jobId, message: 'Collection started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start collection' });
  }
});

// Get collection status
router.get('/status/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const collector = collectors.get(jobId);
  
  if (!collector) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.json(collector.getStatus());
});

// Get collected screenshots
router.get('/list/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const uploadsDir = path.join(__dirname, '../../uploads', jobId);
  
  if (!fs.existsSync(uploadsDir)) {
    return res.status(404).json({ error: 'No screenshots found' });
  }
  
  const metadataPath = path.join(uploadsDir, 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
    return res.status(404).json({ error: 'Metadata not found' });
  }
  
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  res.json(metadata);
});

// Generate fine-tuning data
router.post('/generate-finetuning/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const result = await generateFineTuningData(jobId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate fine-tuning data' });
  }
});

// Download all data as ZIP
router.get('/download/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const uploadsDir = path.join(__dirname, '../../uploads', jobId);
  
  if (!fs.existsSync(uploadsDir)) {
    return res.status(404).json({ error: 'No data found' });
  }
  
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="screenshots_${jobId}.zip"`);
  
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);
  archive.directory(uploadsDir, false);
  archive.finalize();
});

export default router;