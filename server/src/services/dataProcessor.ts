import fs from 'fs/promises';
import path from 'path';
import { ScreenshotMetadata } from './screenshotCollector';

export async function generateFineTuningData(jobId: string) {
  const uploadsDir = path.join(__dirname, '../../uploads', jobId);
  const metadataPath = path.join(uploadsDir, 'metadata.json');
  
  // Read metadata
  const metadataContent = await fs.readFile(metadataPath, 'utf-8');
  const metadata: ScreenshotMetadata[] = JSON.parse(metadataContent);
  
  // Generate fine-tuning data
  const finetuningData = [];
  
  for (const item of metadata) {
    if (item.error) continue;
    
    const imagePath = path.join(uploadsDir, item.filename);
    const imageBase64 = await fs.readFile(imagePath, 'base64');
    
    // Various prompts
    const prompts = [
      {
        user: "What elements can you see on this webpage? Please identify clickable elements.",
        assistant: `This is a ${item.category} website (${item.title}). The page contains various interactive elements typical of a ${item.category} site, including navigation links, buttons, and form inputs.`
      },
      {
        user: "How would I navigate to the search functionality on this page?",
        assistant: `On this ${item.category} site, you would typically find the search functionality in the header area. Look for a search icon or search box, usually located in the top navigation bar.`
      },
      {
        user: "Describe the layout and main sections of this webpage.",
        assistant: `This ${item.title} page follows a typical ${item.category} layout with a header containing navigation, a main content area, and likely a footer with additional links and information.`
      }
    ];
    
    const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    finetuningData.push({
      messages: [
        {
          role: "system",
          content: "You are a web automation assistant that can analyze webpages and help users interact with them."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: selectedPrompt.user
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        },
        {
          role: "assistant",
          content: selectedPrompt.assistant
        }
      ]
    });
  }
  
  // Save fine-tuning data
  const outputPath = path.join(uploadsDir, 'finetuning_data.jsonl');
  const jsonlContent = finetuningData.map(d => JSON.stringify(d)).join('\n');
  await fs.writeFile(outputPath, jsonlContent);
  
  return {
    success: true,
    count: finetuningData.length,
    path: outputPath
  };
}