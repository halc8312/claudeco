/**
 * GPT-4o Visionを使用したウェブ自動化のデモ
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class WebAutomationAgent {
  constructor(modelId) {
    this.modelId = modelId || 'gpt-4o-2024-08-06';
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async captureScreenshot() {
    const screenshot = await this.page.screenshot();
    return screenshot.toString('base64');
  }

  async analyzePageWithVision(instruction) {
    const screenshotBase64 = await this.captureScreenshot();
    
    const response = await openai.chat.completions.create({
      model: this.modelId,
      messages: [
        {
          role: "system",
          content: "You are a web automation assistant. Analyze the webpage and provide specific actions to perform based on the user's instruction. Return your response as JSON with 'action' and 'selector' fields."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: instruction
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${screenshotBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async executeAction(action) {
    switch (action.action) {
      case 'click':
        await this.page.click(action.selector);
        break;
      case 'type':
        await this.page.fill(action.selector, action.value);
        break;
      case 'navigate':
        await this.page.goto(action.url);
        break;
      case 'scroll':
        await this.page.evaluate(() => window.scrollBy(0, action.distance || 500));
        break;
      default:
        console.log(`Unknown action: ${action.action}`);
    }
  }

  async automateTask(url, tasks) {
    await this.page.goto(url);
    
    for (const task of tasks) {
      console.log(`\nExecuting: ${task}`);
      
      try {
        // GPT-4o Visionでページを分析
        const action = await this.analyzePageWithVision(task);
        console.log('AI suggested action:', action);
        
        // アクションを実行
        await this.executeAction(action);
        
        // 少し待つ
        await this.page.waitForTimeout(2000);
        
      } catch (error) {
        console.error(`Error executing task: ${error.message}`);
      }
    }
  }
}

// 使用例
async function main() {
  const agent = new WebAutomationAgent();
  
  try {
    await agent.initialize();
    
    // タスクの例
    await agent.automateTask('https://www.google.com', [
      "Click on the search box",
      "Type 'OpenAI GPT-4o vision' in the search box",
      "Click the search button"
    ]);
    
    console.log('\nAutomation completed!');
    
    // 10秒待ってから終了
    await agent.page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await agent.close();
  }
}

// 環境変数が設定されている場合のみ実行
if (process.env.OPENAI_API_KEY) {
  main();
} else {
  console.log('Please set OPENAI_API_KEY environment variable');
  console.log('Example: OPENAI_API_KEY=your-api-key node web-automation-demo.js');
}