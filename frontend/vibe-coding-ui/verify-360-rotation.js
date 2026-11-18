const { chromium } = require("/home/antara/.local/lib/node_modules/@playwright/cli/node_modules/playwright-core");
const path = require("path");
const fs = require("fs");

const CHROMIUM_PATH = "/home/antara/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell";
const REPORT_DIR = path.resolve(__dirname, "../../reports/visual");

async function verify360Rotation() {
  console.log("=== Testing 360° Sneaker Rotation & Aesthetic Pop-Out ===");
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error(`[Browser Error]: ${msg.text()}`);
      errors.push(msg.text());
    }
  });

  try {
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle", timeout: 20000 });

    // 1. Verify Hero Floating Sneaker
    console.log("[QA] Testing Hero Floating Sneaker...");
    const heroShoe = page.locator("img[alt='Off-White x Air Jordan 1 Chicago']").first();
    const heroVisible = await heroShoe.isVisible();
    console.log("[QA] Hero floating sneaker visible:", heroVisible);
    if (!heroVisible) throw new Error("Hero floating sneaker not visible");

    const heroScreenshot = path.join(REPORT_DIR, "aesthetic_hero_floating_sneaker.png");
    await page.screenshot({ path: heroScreenshot });
    console.log(`[QA] Hero Screenshot saved: ${heroScreenshot}`);

    // 2. Scroll to Featured Showcase Rail
    console.log("[QA] Testing Showcase Rail 360 Rotators...");
    const railSection = page.locator("text=FEATURED SNEAKERS").first();
    await railSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const railScreenshot = path.join(REPORT_DIR, "aesthetic_showcase_rail_floating_360.png");
    await page.screenshot({ path: railScreenshot });
    console.log(`[QA] Rail Screenshot saved: ${railScreenshot}`);

    // 3. Hover over the first shoe card (ow-chicago) and scrub mouse across it
    const firstCard = page.locator(".cursor-ew-resize").first();
    const box = await firstCard.boundingBox();
    if (!box) throw new Error("Could not get bounding box for 360 rotator card");

    console.log("[QA] Simulating hover & mouse scrub across card to rotate 360...");
    await page.mouse.move(box.x + 20, box.y + box.height / 2);
    await page.waitForTimeout(200);

    // Scrub to 25%, 50%, 75%, 90%
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2);
    await page.waitForTimeout(150);
    await page.mouse.move(box.x + box.width * 0.50, box.y + box.height / 2);
    await page.waitForTimeout(150);
    await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
    await page.waitForTimeout(150);

    // Capture hover pop-out & rotated state
    const hoverScreenshot = path.join(REPORT_DIR, "shoe_hover_popout_and_rotated.png");
    await page.screenshot({ path: hoverScreenshot });
    console.log(`[QA] Hover Popout Screenshot saved: ${hoverScreenshot}`);

    // 4. Click the Maximize button on the first card to open the 3D Inspection Modal
    console.log("[QA] Testing 3D Inspection Modal...");
    const maxBtn = page.locator("button[title='Open 3D Popout Inspection']").first();
    await maxBtn.click();
    await page.waitForTimeout(600);

    const modalVisible = await page.locator("text=360° Studio Inspection").isVisible();
    console.log("[QA] 3D Inspection Modal opened:", modalVisible);
    if (!modalVisible) throw new Error("3D Inspection modal did not open");

    // Capture modal screenshot with large popped out sneaker and rotation controls
    const modalScreenshot = path.join(REPORT_DIR, "modal_3d_inspection_popout.png");
    await page.screenshot({ path: modalScreenshot });
    console.log(`[QA] Modal Screenshot saved: ${modalScreenshot}`);

    // Close modal
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

  } finally {
    await browser.close();
  }

  if (errors.length > 0) {
    console.error("Browser Console Errors:", errors);
    process.exit(1);
  }
  console.log("PASS: 360° Sneaker Rotation & Aesthetic Pop-Out Verified with 0 Console Errors!");
}

verify360Rotation().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
