#!/bin/bash

echo "Web Screenshot Collector"
echo "======================="
echo ""
echo "This tool collects screenshots for GPT-4 Vision fine-tuning."
echo ""
echo "Available options:"
echo "1. Use API-based screenshot service (no sudo required)"
echo "2. Use Docker with Playwright (if Docker is installed)"
echo "3. Use cloud-based solution"
echo ""

# Check if dataset directory exists
mkdir -p dataset

# Option 1: Run the API-based collector
echo "Running API-based collector (generates placeholder images)..."
npm run build && node dist/collect-api.js 10

echo ""
echo "Alternative solutions for real screenshots:"
echo ""
echo "1. Using Replit or CodeSandbox:"
echo "   - Upload this project to Replit/CodeSandbox"
echo "   - They have browsers pre-installed"
echo "   - Run: npm install && npm run build && node dist/collect.js"
echo ""
echo "2. Using Google Colab:"
echo "   - Upload the TypeScript files"
echo "   - Install Node.js and dependencies"
echo "   - Colab has Chrome pre-installed"
echo ""
echo "3. Using Screenshot APIs:"
echo "   - Sign up for free tier at screenshotlayer.com"
echo "   - Set SCREENSHOT_API_KEY environment variable"
echo "   - Modify collect-api.ts with your API integration"
echo ""
echo "4. Using GitHub Actions:"
echo "   - Create a workflow that runs the collector"
echo "   - GitHub Actions has browsers available"
echo "   - Store results as artifacts"
echo ""