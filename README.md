# NSE Scraper - Headed Mode

Automated NSE India scraper using Playwright with headed mode for bypassing bot protection.

## 🚀 Quick Start

### Local Development
```bash
npm install
npm start
```

### Manual Test
```bash
npm run dev
```

## 📅 Automated Scheduling

### Daily 9 AM IST
Automatically runs every day at 9:00 AM IST via GitHub Actions.

### Manual Trigger
1. Go to your GitHub repo → **Actions** tab
2. Select **"Manual NSE Scraper Test"**
3. Click **"Run workflow"**

## 🎯 Features

- ✅ **Headed mode** - Bypasses NSE bot protection
- ✅ **TypeScript** - Type-safe development
- ✅ **Screenshots** - Visual proof of execution
- ✅ **GitHub Actions** - Free automated scheduling
- ✅ **Error handling** - Robust failure recovery

## 📊 Output

- Console logs with timestamps
- Screenshots saved to `./screenshots/`
- Page title and URL extraction
- Success/failure status

## 🛠️ Files

- `script.ts` - Main scraper logic
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.github/workflows/` - GitHub Actions automation

## 📈 Usage

The scraper will:
1. Launch Chrome in headed mode
2. Navigate to NSE India
3. Take full-page screenshot
4. Extract page information
5. Log results with timestamps

Perfect for daily market data collection! 🚀