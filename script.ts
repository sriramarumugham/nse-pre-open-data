import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const TARGET_URL = "https://www.nseindia.com/market-data/pre-open-market-cm-and-emerge-market";
const SCREENSHOT_PATH = "./screenshots/pre-open-market.png";
const DOWNLOADS_PATH = "./downloads";

async function run() {
  // Ensure folders exist
  const screenshotDir = SCREENSHOT_PATH.split("/").slice(0, -1).join("/");
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
  if (!fs.existsSync(DOWNLOADS_PATH)) fs.mkdirSync(DOWNLOADS_PATH, { recursive: true });

  console.log("🚀 Launching browser in headed mode...");

  const browser = await chromium.launch({
    headless: false, // headed mode
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=site-per-process',
      '--no-sandbox'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    acceptDownloads: true
  });

  const page = await context.newPage();

  try {
    console.log(`📈 Navigating to ${TARGET_URL}`);
    await page.goto(TARGET_URL, {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    console.log("⏳ Waiting for page to load completely...");
    await page.waitForTimeout(5000);

    console.log("📸 Taking initial screenshot...");
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });

    const title = await page.title();
    console.log("📊 Page title:", title);

    // Look for the Category dropdown
    console.log("🔍 Looking for Category dropdown...");

    try {
      // Wait for the dropdown to be available
      await page.waitForSelector('#sel-Pre-Open-Market', { timeout: 10000 });

      console.log("📋 Found Category dropdown, selecting 'All'...");

      // Click on the dropdown to open it
      await page.click('#sel-Pre-Open-Market');
      await page.waitForTimeout(2000);

      // Select "All" option
      await page.selectOption('#sel-Pre-Open-Market', 'ALL');
      console.log("✅ Selected 'All' category");

      // Wait for data to load after selection
      await page.waitForTimeout(3000);

      console.log("📊 Looking for CSV download option...");

      // Look for CSV download button
      const csvButton = page.locator('text=Download (.csv)').first();

      if (await csvButton.isVisible()) {
        console.log("📥 Found CSV download button, clicking...");

        // Set up download event listener
        const downloadPromise = page.waitForEvent('download');

        // Click the CSV download button
        await csvButton.click();

        // Wait for download to start
        const download = await downloadPromise;
        console.log(`📁 Download started: ${download.suggestedFilename()}`);

        // Save the downloaded file
        const downloadPath = path.join(DOWNLOADS_PATH, download.suggestedFilename() || `pre-open-data-${Date.now()}.csv`);
        await download.saveAs(downloadPath);

        console.log(`✅ CSV file downloaded to: ${downloadPath}`);

        // Take screenshot after download
        await page.screenshot({ path: "./screenshots/after-download.png", fullPage: true });

      } else {
        console.log("❌ CSV download button not found");
      }

    } catch (selectorError: any) {
      console.log("⚠️  Could not find Category dropdown or CSV button:", selectorError.message);

      // Take error screenshot
      await page.screenshot({ path: "./screenshots/error-state.png", fullPage: true });
    }

    console.log("✅ Pre-open market data extraction completed");

  } catch (err) {
    console.error("❌ Error during automation:", err);

    // Try to get current page info even on error
    try {
      const currentUrl = page.url();
      console.log("Current URL at error:", currentUrl);
      await page.screenshot({ path: "./screenshots/error-page.png" });
    } catch (errorScreenshotErr) {
      console.log("Could not take error screenshot");
    }
  } finally {
    await browser.close();
    console.log("🔒 Browser closed");
  }
}

// Add timestamp for logging
console.log(`🕐 Starting NSE scraper at ${new Date().toISOString()}`);
run().then(() => {
  console.log(`🏁 NSE scraper finished at ${new Date().toISOString()}`);
}).catch(error => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});