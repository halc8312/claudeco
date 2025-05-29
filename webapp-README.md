# Web Screenshot Collector - Web Application

GPT-4o Visionファインチューニング用のスクリーンショット収集ウェブアプリケーション

## 機能

- 🖥️ **ウェブUI**: 使いやすいインターフェース
- 📸 **スクリーンショット収集**: 最大1000枚まで
- 📈 **リアルタイム進捗**: WebSocketでリアルタイム更新
- 🎨 **ギャラリー表示**: 収集したスクリーンショットを一覧表示
- 📦 **ダウンロード**: ZIP形式で一括ダウンロード
- 🤖 **ファインチューニングデータ生成**: GPT-4o用JSONL形式

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境設定

```bash
cp server/.env.example server/.env
# 必要に応じてSCREENSHOT_API_KEYを設定
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## 使い方

1. **スクリーンショット数を設定** (1-1000)
2. **APIキーを入力** (オプション)
   - 空の場合はプレースホルダー画像
   - screenshotlayer.comで無料キー取得可
3. **カスタムURLを入力** (オプション)
4. **Start Collectionをクリック**
5. **進捗を確認**
6. **完了後、ギャラリーで確認**
7. **Generate Fine-tuning Dataでデータ生成**
8. **Download AllでZIPダウンロード**

## プロダクションビルド

```bash
npm run build
npm start
```

## 技術スタック

- **バックエンド**: Express.js, TypeScript, Socket.io
- **フロントエンド**: React, TypeScript, Vite, Tailwind CSS
- **画像処理**: Sharp
- **リアルタイム通信**: WebSocket

## APIエンドポイント

- `POST /api/screenshots/collect` - 収集開始
- `GET /api/screenshots/status/:jobId` - ステータス取得
- `GET /api/screenshots/list/:jobId` - スクリーンショット一覧
- `POST /api/screenshots/generate-finetuning/:jobId` - ファインチューニングデータ生成
- `GET /api/screenshots/download/:jobId` - ZIPダウンロード

## ディレクトリ構造

```
├── server/              # Express.jsバックエンド
│   ├── src/
│   │   ├── routes/     # APIルート
│   │   ├── services/   # ビジネスロジック
│   │   ├── socket/     # WebSocketハンドラ
│   │   └── config/     # 設定
│   └── uploads/        # スクリーンショット保存先
└── client/              # Reactフロントエンド
    └── src/
        └── components/  # UIコンポーネント
```