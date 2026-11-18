const { chromium } = require("/home/antara/.local/lib/node_modules/@playwright/cli/node_modules/playwright-core");
const path = require("path");
const fs = require("fs");

const CHROMIUM_PATH = "/home/antara/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell";
const REPORT_DIR = path.resolve(__dirname, "../../reports/visual");
const ARTIFACT_DIR = "/home/antara/.gemini/antigravity-cli/brain/0e54f385-0895-47f4-8331-ab2e7cbad9ed";
const PORT = process.env.PORT || "3001";

async function capturePoints() {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    headless: true,
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: "networkidle", timeout: 15000 });

    // 1. Capture Point 3: Scrollable Sneaker Carousel
    const carouselHeading = page.locator("text=Iconic StockX Releases");
    await carouselHeading.waitFor({ state: "visible", timeout: 5000 });
    const carouselSection = page.locator("section:has-text('MARKET SPOTLIGHT')");
    
    const p3Path = path.join(REPORT_DIR, "point3_sneaker_carousel.png");
    await carouselSection.screenshot({ path: p3Path });
    console.log(`[Captured] Point 3 Carousel: ${p3Path}`);

    // 2. Capture Point 1 & 2: 3D Tilt Card & Animated Price Counter
    const cardSection = page.locator("div.lg\\:col-span-5");
    await cardSection.waitFor({ state: "visible", timeout: 5000 });

    const p12Path = path.join(REPORT_DIR, "point2_price_counter_and_3d_card.png");
    await cardSection.screenshot({ path: p12Path });
    console.log(`[Captured] Point 1 & 2 3D Card and Counter: ${p12Path}`);

    // 3. Capture Hero + Carousel + Cockpit Viewport (Top 900px viewport as seen on open)
    const heroAboveFold = path.join(REPORT_DIR, "viewport_above_fold.png");
    await page.screenshot({ path: heroAboveFold, clip: { x: 0, y: 0, width: 1440, height: 900 } });
    console.log(`[Captured] Above Fold Viewport: ${heroAboveFold}`);

    // Copy to artifact directory for embedding in conversation
    fs.copyFileSync(p3Path, path.join(ARTIFACT_DIR, "point3_sneaker_carousel.png"));
    fs.copyFileSync(p12Path, path.join(ARTIFACT_DIR, "point2_price_counter_and_3d_card.png"));
    fs.copyFileSync(heroAboveFold, path.join(ARTIFACT_DIR, "viewport_above_fold.png"));
    console.log("[Copied] All screenshots copied to artifact directory.");
  } finally {
    await browser.close();
  }
}

capturePoints().catch(err => {
  console.error("Capture Error:", err);
  process.exit(1);
});
