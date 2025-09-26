# NSE Scraper - TLDR

**What:** Automated scraper for NSE India using Playwright (headed mode to bypass bot protection)

**Quick Start:**

```bash
npm install
npm start
```

**Schedule:** Runs daily at 9.10 AM IST via GitHub Actions (or trigger manually in Actions tab)

**Output:** Screenshots + console logs in `./screenshots/`

**Key Files:** `script.ts` (main logic), `.github/workflows/` (automation)

## API Endpoints (Cloudflare Workers)

**Base URL:** `https://your-api-domain.workers.dev`

**Available Endpoints:**

1. **List Historic Dates** - `GET /api/dates?page=1&limit=10`

   - Returns paginated list of available dates with data
   - Rate limited: 30 requests/minute per IP

2. **Download CSV** - `GET /api/download/{date}`
   - Example: `/api/download/2024-09-24`
   - Returns CSV file with pre-open market data for that date
   - Format: Stock symbols, prices, bid/ask data, market indicators

**API Docs:** Visit base URL for interactive Swagger UI
