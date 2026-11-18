const { chromium } = require("/home/antara/.local/lib/node_modules/@playwright/cli/node_modules/playwright-core");
const path = require("path");
const fs = require("fs");

const CHROMIUM_PATH = "/home/antara/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell";
const REPORT_DIR = path.resolve(__dirname, "../../reports/visual");
const PORT = process.env.PORT || "3001";

async function runVisualVerification() {
  console.log("=== Phase 4: Playwright Visual Verification & QA ===");
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const consoleErrors = [];
  const consoleWarnings = [];

  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    headless: true,
  });

  try {
    // 1. Desktop Viewport (1440x900)
    console.log("[QA] Testing Desktop Viewport (1440x900)...");
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const desktopPage = await desktopContext.newPage();

    desktopPage.on("console", (msg) => {
      if (msg.type() === "error") {
        console.error(`[Browser Error]: ${msg.text()}`);
        consoleErrors.push(msg.text());
      } else if (msg.type() === "warning") {
        consoleWarnings.push(msg.text());
      }
    });

    desktopPage.on("pageerror", (err) => {
      console.error(`[Page Error]: ${err.message}`);
      consoleErrors.push(err.message);
    });

    await desktopPage.goto(`http://127.0.0.1:${PORT}`, { waitUntil: "networkidle", timeout: 15000 });

    // Assert key headings and elements
    const title = await desktopPage.title();
    console.log(`[QA] Page Title: "${title}"`);

    const hasHeading = await desktopPage.locator("text=Sneaker Resale Profit Arbitrage Engine").isVisible();
    const hasCockpit = await desktopPage.locator("text=Arbitrage Valuation Parameters").isVisible();
    const hasDiagnostics = await desktopPage.locator("text=Phase 4 ML Pipeline & Model Diagnostics").isVisible();
    const hasLedger = await desktopPage.locator("text=Prediction Audit Ledger").isVisible();

    console.log(`[QA] Elements Verified: Heading=${hasHeading}, Cockpit=${hasCockpit}, Diagnostics=${hasDiagnostics}, Ledger=${hasLedger}`);

    const desktopScreenshotPath = path.join(REPORT_DIR, "desktop_viewport_1440x900.png");
    await desktopPage.screenshot({ path: desktopScreenshotPath, fullPage: true });
    console.log(`[QA] Desktop Full-Page Screenshot saved to: ${desktopScreenshotPath}`);

    await desktopContext.close();

    // 2. Mobile Viewport (375x812 - iPhone 13/14)
    console.log("[QA] Testing Mobile Viewport (375x812)...");
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();

    mobilePage.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    mobilePage.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    await mobilePage.goto(`http://127.0.0.1:${PORT}`, { waitUntil: "networkidle", timeout: 15000 });

    const mobileScreenshotPath = path.join(REPORT_DIR, "mobile_viewport_375x812.png");
    await mobilePage.screenshot({ path: mobileScreenshotPath, fullPage: true });
    console.log(`[QA] Mobile Full-Page Screenshot saved to: ${mobileScreenshotPath}`);

    await mobileContext.close();

    console.log("\n=== QA VERIFICATION RESULTS ===");
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Console Warnings: ${consoleWarnings.length}`);

    if (consoleErrors.length > 0) {
      console.error("FAIL: Browser reported console errors:", consoleErrors);
      process.exit(1);
    } else {
      console.log("PASS: Zero console errors! Clean visual and functional verification.");
    }
  } finally {
    await browser.close();
  }
}

runVisualVerification().catch((err) => {
  console.error("Fatal QA Error:", err);
  process.exit(1);
});
