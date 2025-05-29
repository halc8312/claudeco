# デプロイガイド

## オプション1: Dockerでローカルデプロイ

```bash
# ビルドと起動
docker-compose up --build

# バックグラウンドで起動
docker-compose up -d
```

アクセス: http://localhost:5000

## オプション2: Railway.appへのデプロイ

1. [Railway.app](https://railway.app)でアカウント作成
2. GitHubリポジトリを接続
3. 環境変数を設定:
   - `SCREENSHOT_API_KEY`: スクリーンショットAPIキー
4. Deployをクリック

## オプション3: Render.comへのデプロイ

1. [Render.com](https://render.com)でアカウント作成
2. New > Web Service
3. GitHubリポジトリを接続
4. 設定:
   - Build Command: `cd server && npm install && npm run build && cd ../client && npm install && npm run build && cp -r dist ../server/public`
   - Start Command: `cd server && node dist/index.js`
5. 環境変数を追加:
   - `SCREENSHOT_API_KEY`

## オプション4: VPSへのデプロイ

```bash
# 1. コードをクローン
git clone https://github.com/yourusername/screenshot-collector.git
cd screenshot-collector

# 2. 依存関係をインストール
cd server && npm install
cd ../client && npm install

# 3. ビルド
cd server && npm run build
cd ../client && npm run build
cp -r dist ../server/public

# 4. PM2で起動
npm install -g pm2
cd server
pm2 start dist/index.js --name screenshot-collector

# 5. Nginx設定
sudo nano /etc/nginx/sites-available/screenshot-collector
```

Nginx設定:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Nginxを有効化
sudo ln -s /etc/nginx/sites-available/screenshot-collector /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## オプション5: Google Cloud Run

```bash
# 1. Google Cloud SDKをインストール
# 2. プロジェクトを設定
gcloud config set project YOUR_PROJECT_ID

# 3. Artifact Registryを有効化
gcloud services enable artifactregistry.googleapis.com

# 4. Dockerイメージをビルド
docker build -t gcr.io/YOUR_PROJECT_ID/screenshot-collector .

# 5. イメージをプッシュ
docker push gcr.io/YOUR_PROJECT_ID/screenshot-collector

# 6. Cloud Runにデプロイ
gcloud run deploy screenshot-collector \
  --image gcr.io/YOUR_PROJECT_ID/screenshot-collector \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SCREENSHOT_API_KEY=your_key
```

## 環境変数

すべてのデプロイ方法で以下の環境変数を設定:

- `NODE_ENV`: production
- `PORT`: 5000 (またはプラットフォーム指定)
- `SCREENSHOT_API_KEY`: (オプション) screenshotlayer.comのAPIキー

## 注意事項

1. **ストレージ**: スクリーンショットはローカルストレージに保存されます
2. **スケーリング**: 大量のスクリーンショットにはS3などのオブジェクトストレージを推奨
3. **メモリ**: 同時収集数が多い場合はメモリを増やす必要あり