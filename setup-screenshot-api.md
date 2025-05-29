# スクリーンショットAPIの設定方法

現在はプレースホルダー画像が生成されていますが、実際のスクリーンショットを取得するには以下の無料APIを利用できます。

## 1. Screenshotlayer (推奨)

- **無料枠**: 1000スクリーンショット/月
- **URL**: https://screenshotlayer.com

### 設定手順：
1. https://screenshotlayer.com/product にアクセス
2. "Get Free API Key"をクリック
3. アカウントを作成
4. APIキーを取得
5. 以下のコマンドで設定：

```bash
export SCREENSHOT_API_KEY="your_api_key_here"
node dist/collect-api.js 100
```

## 2. APIFlash

- **無料枠**: 100スクリーンショット/月
- **URL**: https://apiflash.com

### 設定手順：
1. https://apiflash.com にアクセス
2. "Get Started Free"をクリック
3. アカウント作成後、APIキーを取得

## 3. ScreenshotAPI.net

- **無料枠**: 100スクリーンショット/月  
- **URL**: https://screenshotapi.net

### 設定手順：
1. https://screenshotapi.net にアクセス
2. "Sign Up Free"をクリック
3. APIキーを取得

## 使用方法

### 1. APIキーを設定
```bash
# Linux/Mac
export SCREENSHOT_API_KEY="your_api_key_here"

# Windows (PowerShell)
$env:SCREENSHOT_API_KEY="your_api_key_here"
```

### 2. スクリーンショットを収集
```bash
# 100枚のスクリーンショットを収集
node dist/collect-api.js 100

# 1000枚収集（Screenshotlayerの場合）
node dist/collect-api.js 1000
```

### 3. ファインチューニングデータに変換
```bash
node dist/convert-to-finetuning.js
```

### 4. 生成されたファイル
- `dataset/`: スクリーンショット画像
- `dataset/metadata.jsonl`: メタデータ
- `data/finetuning_data.jsonl`: GPT-4oファインチューニング用データ

## 注意事項

- 無料プランには月間制限があります
- APIキーは安全に保管してください
- 大量のスクリーンショットが必要な場合は、複数のAPIを組み合わせるか、有料プランを検討してください

## トラブルシューティング

### APIキーが認識されない場合
```bash
# 現在の環境変数を確認
echo $SCREENSHOT_API_KEY

# .envファイルを使用する場合
echo "SCREENSHOT_API_KEY=your_api_key_here" > .env
```

### API制限に達した場合
- 月が変わるまで待つ
- 別のAPIサービスを使用
- 有料プランにアップグレード