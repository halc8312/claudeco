# GPT-4o Visionファインチューニング用 Webスクリーンショットコレクター

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

GPT-4o Visionモデルのファインチューニング用に、多様なウェブサイトのスクリーンショットを自動収集し、トレーニングデータを生成するウェブアプリケーションです。

## 🌟 主な機能

### 🖥️ ウェブアプリケーション
- **直感的なUI**: React + Tailwind CSSで構築されたモダンなインターフェース
- **リアルタイム進捗**: WebSocketを使用したリアルタイム進捗表示
- **ギャラリービュー**: 収集したスクリーンショットの一覧表示
- **ワンクリックダウンロード**: 全データのZIPダウンロード

### 📸 スクリーンショット収集
- **大量収集**: 最大1000枚までのスクリーンショットを自動収集
- **多様なカテゴリ**: EC、ニュース、SNSなど10以上のカテゴリ
- **カスタムURL**: 独自のURLリストもサポート
- **API/プレースホルダー**: スクリーンショットAPIまたはプレースホルダー画像

### 🤖 AIファインチューニング対応
- **OpenAI仕様準拠**: GPT-4o Visionのファインチューニング形式に完全対応
- **メタデータ自動生成**: ページ情報を自動抽出
- **JSONLエクスポート**: そのままOpenAI APIで使用可能

## 🚀 クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/halc8312/claudeco.git
cd claudeco
```

### 2. 依存関係のインストール

```bash
# サーバーとクライアントの依存関係をインストール
cd server && npm install
cd ../client && npm install
```

### 3. 開発サーバーの起動

```bash
# ターミナル1: バックエンド
cd server && npm run dev

# ターミナル2: フロントエンド
cd client && npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## 📚 使い方

### ウェブUIでの使用

1. **収集設定**
   - スクリーンショット数（1-1000）を設定
   - （オプション）APIキーを入力
   - （オプション）カスタムURLを入力

2. **収集開始**
   - "Start Collection"をクリック
   - リアルタイムで進捗を確認

3. **結果の確認**
   - ギャラリーでスクリーンショットを確認
   - "Generate Fine-tuning Data"でデータ生成
   - "Download All"でZIPダウンロード

### コマンドラインでの使用

```bash
# API経由でスクリーンショット収集
export SCREENSHOT_API_KEY="your_api_key"
node dist/collect-api.js 100

# ファインチューニングデータに変換
node dist/convert-to-finetuning.js
```

## 📦 デプロイ

### Dockerでのデプロイ

```bash
docker-compose up --build
```

### Railway/Renderへのデプロイ

1. GitHubにコードをプッシュ
2. RailwayまたはRenderでリポジトリを接続
3. 環境変数を設定
4. デプロイ！

詳細は[DEPLOY.md](./DEPLOY.md)を参照してください。

## 📝 スクリーンショットAPIの設定

実際のスクリーンショットを取得する場合：

1. [Screenshotlayer](https://screenshotlayer.com) （無料1000枚/月）
2. [APIFlash](https://apiflash.com) （無料100枚/月）
3. [ScreenshotAPI](https://screenshotapi.net) （無料100枚/月）

詳細は[setup-screenshot-api.md](./setup-screenshot-api.md)を参照してください。

## 📡 APIエンドポイント

| メソッド | エンドポイント | 説明 |
|---------|----------------|------|
| POST | `/api/screenshots/collect` | スクリーンショット収集を開始 |
| GET | `/api/screenshots/status/:jobId` | 収集ステータスを取得 |
| GET | `/api/screenshots/list/:jobId` | スクリーンショット一覧を取得 |
| POST | `/api/screenshots/generate-finetuning/:jobId` | ファインチューニングデータを生成 |
| GET | `/api/screenshots/download/:jobId` | 全データをZIPでダウンロード |

## 📁 プロジェクト構造

```
claudeco/
├── server/              # Express.jsバックエンド
│   ├── src/
│   │   ├── routes/     # APIルート
│   │   ├── services/   # ビジネスロジック
│   │   ├── socket/     # WebSocketハンドラ
│   │   └── config/     # 設定ファイル
│   └── uploads/        # スクリーンショット保存先
├── client/              # Reactフロントエンド
│   └── src/
│       └── components/ # UIコンポーネント
├── src/                 # CLIツール（レガシー）
├── examples/            # 使用例
└── docs/                # ドキュメント
```

## 🔧 技術スタック

### バックエンド
- Node.js + Express.js
- TypeScript
- Socket.io（リアルタイム通信）
- Sharp（画像処理）

### フロントエンド
- React 18
- TypeScript
- Vite（ビルドツール）
- Tailwind CSS
- Lucide React（アイコン）

### デプロイ
- Docker
- Railway/Render対応
- PM2 + Nginx対応

## 🤝 貢献

プルリクエストやイシューの作成を歓迎します！

1. フォークする
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

MIT License - 詳細は[LICENSE](./LICENSE)ファイルを参照してください。

## 👥 作者

[@halc8312](https://github.com/halc8312)

## 🙏 謝辞

- OpenAIのGPT-4o Visionモデル
- スクリーンショットAPIプロバイダー
- オープンソースコミュニティ

---

<p align="center">
  Made with ❤️ for AI researchers and developers
</p>
