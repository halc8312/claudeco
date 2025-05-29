#!/usr/bin/env node
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

interface Metadata {
  id: string;
  url: string;
  title: string;
  category: string;
  screenshot_filename: string;
  viewport: { width: number; height: number };
  timestamp: string;
  page_type: string;
}

interface FineTuningMessage {
  messages: Array<{
    role: string;
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  }>;
}

/**
 * APIコレクターのデータをGPT-4o Visionファインチューニング形式に変換
 */
async function convertToFineTuning() {
  const metadataPath = './dataset/metadata.jsonl';
  const outputPath = './data/finetuning_data.jsonl';
  const imageBaseDir = './dataset';

  if (!existsSync(metadataPath)) {
    console.error('エラー: metadata.jsonlが見つかりません。先にcollect-api.jsを実行してください。');
    process.exit(1);
  }

  // ディレクトリを作成
  await fs.mkdir('./data', { recursive: true });

  // メタデータを読み込み
  const metadataContent = await fs.readFile(metadataPath, 'utf-8');
  const metadataLines = metadataContent.trim().split('\n');
  const metadata: Metadata[] = metadataLines.map(line => JSON.parse(line));

  console.log(`変換中: ${metadata.length}件のデータ`);

  // ファインチューニングデータを生成
  const finetuningData: FineTuningMessage[] = [];

  for (const meta of metadata) {
    const imagePath = path.join(imageBaseDir, meta.screenshot_filename);
    
    // 様々なプロンプトパターンを作成
    const prompts = [
      {
        user: "What elements can you see on this webpage? Please identify clickable elements.",
        assistant: `This is a ${meta.category} website (${meta.title}). The page contains various interactive elements typical of a ${meta.page_type} page, including navigation links, buttons, and form inputs.`
      },
      {
        user: "How would I navigate to the search functionality on this page?",
        assistant: `On this ${meta.category} site, you would typically find the search functionality in the header area. Look for a search icon or search box, usually located in the top navigation bar.`
      },
      {
        user: "Describe the layout and main sections of this webpage.",
        assistant: `This ${meta.title} page follows a typical ${meta.page_type} layout with a header containing navigation, a main content area, and likely a footer with additional links and information.`
      },
      {
        user: "What actions can I perform on this page?",
        assistant: `On this ${meta.category} page, you can perform various actions such as clicking navigation links, interacting with buttons, filling out forms, and accessing different sections of the ${meta.page_type} content.`
      }
    ];

    // ランダムにプロンプトを選択
    const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    finetuningData.push({
      messages: [
        {
          role: "system",
          content: "You are a web automation assistant that can analyze webpages and help users interact with them. Provide specific, actionable guidance based on what you see in the screenshots."
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
                url: `data:image/jpeg;base64,${await imageToBase64(imagePath)}`
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

  // JSONL形式で保存
  const jsonlContent = finetuningData.map(d => JSON.stringify(d)).join('\n');
  await fs.writeFile(outputPath, jsonlContent);

  console.log(`\n✓ 変換完了!`);
  console.log(`  ファインチューニングデータ: ${outputPath}`);
  console.log(`  トレーニングサンプル数: ${finetuningData.length}`);
  
  // サンプルを表示
  console.log('\n=== サンプルデータ ===');
  const sample = finetuningData[0];
  console.log(JSON.stringify({
    ...sample,
    messages: sample.messages.map(m => {
      if (m.role === 'user' && Array.isArray(m.content)) {
        return {
          ...m,
          content: m.content.map(c => {
            if (c.type === 'image_url') {
              return { ...c, image_url: { url: 'base64_image_data...' } };
            }
            return c;
          })
        };
      }
      return m;
    })
  }, null, 2));
}

async function imageToBase64(imagePath: string): Promise<string> {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error(`画像読み込みエラー: ${imagePath}`);
    // プレースホルダーのbase64データを返す
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
}

// メイン実行
if (require.main === module) {
  convertToFineTuning().catch(console.error);
}