#!/usr/bin/env node
import { WebsiteCollector } from './collector';

async function main() {
  const collector = new WebsiteCollector();
  
  try {
    await collector.initialize();
    
    // コマンドライン引数から数を取得
    const limit = process.argv[2] ? parseInt(process.argv[2], 10) : 1000;
    
    console.log(`=== Web Screenshot Collector ===`);
    console.log(`Target: ${limit} websites`);
    console.log(`Output: ./screenshots/`);
    console.log(`================================\n`);
    
    await collector.collectAll(limit);
    await collector.exportForFineTuning();
    
  } catch (error) {
    console.error('Error during collection:', error);
    process.exit(1);
  }
}

main();