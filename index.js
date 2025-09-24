import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-features=site-per-process",
      "--no-sandbox",
    ],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    console.log("Navigating to NSE India...");
    await page.goto("https://www.nseindia.com/", {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    console.log("Page loaded, title:", await page.title());

    // Wait a bit for any dynamic content
    await page.waitForTimeout(3000);

    // Take screenshot for debugging
    await page.screenshot({ path: "nse-screenshot.png" });
    console.log("creenshot saved as nse-scrSeenshot.png");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await browser.close();
  }
})();
