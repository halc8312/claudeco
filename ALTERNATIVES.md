# Alternative Solutions for Running Playwright Without Sudo

Since installing system dependencies requires sudo access, here are several alternative approaches:

## 1. ✅ API-Based Screenshot Service (Implemented)
**Status: Working**
- Uses screenshot APIs or generates placeholder images
- No system dependencies required
- Run: `node dist/collect-api.js [number_of_screenshots]`

### Free Screenshot API Services:
- **Screenshotlayer**: 1000 free screenshots/month
- **APIFlash**: 100 free screenshots/month  
- **ScreenshotAPI.net**: 100 free screenshots/month
- **Urlbox.io**: 1000 free screenshots/month

## 2. 🐳 Docker Solution
If Docker becomes available:
```bash
docker run -v $(pwd):/app -w /app mcr.microsoft.com/playwright:v1.52.0-noble \
  npm install && npm run build && node dist/collect.js
```

## 3. ☁️ Cloud-Based Solutions

### GitHub Actions
Create `.github/workflows/collect-screenshots.yml`:
```yaml
name: Collect Screenshots
on:
  workflow_dispatch:
    inputs:
      count:
        description: 'Number of screenshots'
        default: '100'

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: node dist/collect.js ${{ github.event.inputs.count }}
      - uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: dataset/
```

### Google Colab
```python
!apt update && apt install -y nodejs npm
!npm install -g n && n latest
!git clone <your-repo>
!cd <repo> && npm install
!npx playwright install --with-deps
!npm run build && node dist/collect.js
```

### Replit/CodeSandbox
1. Import this project
2. Install dependencies
3. Run the collector (browsers pre-installed)

## 4. 🖥️ Headless Chrome Binary
Download portable Chromium:
```bash
wget https://download-chromium.appspot.com/dl/Linux_x64
unzip chrome-linux.zip
export PUPPETEER_EXECUTABLE_PATH=$(pwd)/chrome-linux/chrome
```

## 5. 🌐 Browser Automation Services
- **Browserless.io**: Hosted Chrome instances
- **BrightData/Smartproxy**: Browser automation APIs
- **ScrapingBee**: JavaScript rendering API

## 6. 🔧 WSL2 Specific Solutions
Since you're on WSL2:
1. Install Chrome on Windows
2. Use Windows Chrome from WSL2:
   ```bash
   export PUPPETEER_EXECUTABLE_PATH="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
   ```

## Current Working Solution
The `collect-api.ts` script works without any system dependencies:
```bash
# Build the project
npm run build

# Collect screenshots (creates placeholders)
node dist/collect-api.js 10

# With real screenshots (requires API key)
export SCREENSHOT_API_KEY=your_api_key
node dist/collect-api.js 1000
```

## Recommended Next Steps
1. Sign up for a free screenshot API service
2. Set the API key as environment variable
3. Modify `collect-api.ts` to use your chosen API
4. Run the collector to get real screenshots