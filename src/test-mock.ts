#!/usr/bin/env node
import { MockCollector } from './mock-collector';

async function main() {
  const collector = new MockCollector();
  
  try {
    await collector.initialize();
    
    console.log(`=== モックデータ生成デモ ===`);
    console.log(`ファインチューニング用のサンプルデータを生成します`);
    console.log(`================================\n`);
    
    // 10件のモックデータを生成
    await collector.collectMockData(10);
    
    console.log('\n完了！');
    console.log('\n生成されたファイル:');
    console.log('- data/mock_metadata.jsonl (メタデータ)');
    console.log('- data/mock_finetuning_data.jsonl (ファインチューニング用データ)');
    
  } catch (error) {
    console.error('エラー:', error);
    process.exit(1);
  }
}

main();