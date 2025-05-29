# セットアップガイド

## システム要件

- Node.js 18以上
- Ubuntu/Debian系Linux（Playwrightのシステム依存関係）
- 8GB以上のRAM（並行処理のため）
- 10GB以上の空きディスク容量（スクリーンショット保存用）

## インストール手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/halc8312/claudeco.git
cd claudeco
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Playwrightの設定

```bash
# Chromiumブラウザのインストール
npx playwright install chromium

# システム依存関係のインストール（sudoが必要）
sudo npx playwright install-deps

# または手動でインストール
sudo apt-get update
sudo apt-get install -y \
    libnss3 \
    libnspr4 \
    libasound2t64 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libpango-1.0-0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxss1 \
    libxtst6
```

### 4. ビルド

```bash
npm run build
```

## 使用方法

### 基本的な実行

```bash
# 10枚のスクリーンショットを収集
npm run collect 10

# デフォルト（1000枚）を収集
npm run collect
```

### カスタマイズ

`src/config.ts`を編集してカスタマイズ：

```typescript
export const config = {
  // スクリーンショット設定
  screenshot: {
    maxWidth: 2048,    // OpenAI仕様の最大解像度
    maxHeight: 2048,
    format: 'png',
    quality: 90,
    fullPage: true,    // ページ全体をキャプチャ
  },
  
  // 並行処理数（メモリに応じて調整）
  concurrency: 3,
  
  // タイムアウト（ミリ秒）
  timeout: 30000,
  
  // リトライ設定
  retry: {
    attempts: 3,
    delay: 1000,
  },
};
```

### URLリストの追加

`src/config.ts`の`websiteCategories`にURLを追加：

```typescript
export const websiteCategories = {
  'custom': [
    'https://example.com',
    'https://another-site.com',
  ],
  // ... 他のカテゴリ
};
```

## トラブルシューティング

### 「Host system is missing dependencies」エラー

```bash
# Playwrightの依存関係をインストール
sudo npx playwright install-deps
```

### メモリ不足エラー

```bash
# Node.jsのメモリ制限を増やす
export NODE_OPTIONS="--max-old-space-size=8192"
npm run collect
```

### タイムアウトエラー

`src/config.ts`でタイムアウト値を増やす：

```typescript
timeout: 60000, // 60秒に増加
```

## Docker環境での実行

```dockerfile
FROM node:18-slim

# Playwright依存関係
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Playwrightブラウザのインストール
RUN npx playwright install chromium

CMD ["npm", "run", "collect"]
```

## 次のステップ

1. スクリーンショット収集完了後、`data/finetuning_data.jsonl`を確認
2. OpenAI APIを使用してファインチューニングジョブを作成
3. ファインチューニング済みモデルをウェブ自動化タスクに使用