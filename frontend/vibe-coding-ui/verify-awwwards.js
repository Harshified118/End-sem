const { chromium } = require("/home/antara/.local/lib/node_modules/@playwright/cli/node_modules/playwright-core");
const path = require("path");
const fs = require("fs");

const CHROMIUM_PATH = "/home/antara/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell";
const REPORT_DIR = path.resolve(__dirname, "../../reports/visual");
const PORT = process.env.PORT || "3000";

async function verify() {
  console.log("=== Playwright Awwwards UI Verification ===");
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    headless: true,
  });

  const errors = [];
  const warnings = [];

  try {
    // 1. Desktop Viewport (1440x900)
    console.log("[QA] Testing Desktop 1440x900...");
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.error(`[Browser Error]: ${msg.text()}`);
        errors.push(msg.text());
      } else if (msg.type() === "warning") {
        warnings.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      console.error(`[Page Error]: ${err.message}`);
      errors.push(err.message);
    });

    await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: "networkidle", timeout: 20000 });

    // Assert key components
    const hasHero = await page.locator("text=MACHINE INTELLIGENCE").first().isVisible();
    const hasRail = await page.locator("text=FEATURED SPECIMENS").first().isVisible();
    const hasMarquee = await page.locator("text=STOCKX REAL-TIME SPREAD TICKER").first().isVisible();
    const hasCockpit = await page.locator("text=Arbitrage Valuation Parameters").first().isVisible();

    console.log(`[QA] Elements: Hero=${hasHero}, Rail=${hasRail}, Marquee=${hasMarquee}, Cockpit=${hasCockpit}`);

    if (!hasHero || !hasRail || !hasMarquee || !hasCockpit) {
      throw new Error(`Component visibility assertion failed: Hero=${hasHero}, Rail=${hasRail}, Marquee=${hasMarquee}, Cockpit=${hasCockpit}`);
    }

    // Scroll down to test Lenis and GSAP interaction
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    const desktopScreenshotPath = path.join(REPORT_DIR, "desktop_awwwards_1440x900.png");
    await page.screenshot({ path: desktopScreenshotPath, fullPage: true });
    console.log(`[QA] Desktop Screenshot saved: ${desktopScreenshotPath}`);

    // 2. Mobile Viewport (375x812 - iPhone 13)
    console.log("[QA] Testing Mobile 375x812...");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    // Verify zero horizontal overflow on mobile
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`[QA] Mobile Dimensions: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
    if (scrollWidth > clientWidth + 1) {
      console.warn(`[QA Warning] Horizontal overflow detected: scrollWidth=${scrollWidth} > clientWidth=${clientWidth}`);
    }

    const mobileScreenshotPath = path.join(REPORT_DIR, "mobile_awwwards_375x812.png");
    await page.screenshot({ path: mobileScreenshotPath, fullPage: true });
    console.log(`[QA] Mobile Screenshot saved: ${mobileScreenshotPath}`);

    await page.close();
  } finally {
    await browser.close();
  }

  if (errors.length > 0) {
    console.error("Browser Console Errors:", errors);
    process.exit(1);
  }
  console.log("PASS: Awwwards UI Verification Completed with 0 Console Errors!");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
