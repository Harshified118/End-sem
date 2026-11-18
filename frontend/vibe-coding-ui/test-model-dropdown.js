const { chromium } = require("/home/antara/.local/lib/node_modules/@playwright/cli/node_modules/playwright-core");
const path = require("path");
const fs = require("fs");

const CHROMIUM_PATH = "/home/antara/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell";
const REPORT_DIR = path.resolve(__dirname, "../../reports/visual");

async function verifyModelDropdown() {
  console.log("=== Testing Dynamic Sneaker Model Dropdown ===");
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

    // Scroll down to the Valuation Cockpit
    await page.locator("text=VALUATION INPUT PARAMETERS").first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Verify initial Yeezy models in model dropdown
    const modelSelect = page.locator("select").nth(1);
    const initialOptions = await modelSelect.locator("option").allInnerTexts();
    console.log("[QA] Initial Model Options count:", initialOptions.length);
    console.log("[QA] First 3 options:", initialOptions.slice(0, 3));

    const hasZebra = initialOptions.some((o) => o.includes("Zebra"));
    console.log("[QA] Contains Yeezy Zebra:", hasZebra);
    if (!hasZebra) throw new Error("Yeezy models not found in model dropdown initially");

    // Change Brand to "Jordan"
    const brandSelect = page.locator("select").first();
    await brandSelect.selectOption("Jordan");
    await page.waitForTimeout(400);

    // Verify updated Jordan models in model dropdown
    const jordanOptions = await modelSelect.locator("option").allInnerTexts();
    console.log("[QA] Jordan Model Options count:", jordanOptions.length);
    console.log("[QA] First 3 Jordan options:", jordanOptions.slice(0, 3));
    const hasChicago = jordanOptions.some((o) => o.includes("Chicago"));
    console.log("[QA] Contains Jordan Chicago:", hasChicago);
    if (!hasChicago) throw new Error("Jordan models not populated after selecting Jordan brand");

    // Change Brand to "Nike"
    await brandSelect.selectOption("Nike");
    await page.waitForTimeout(400);

    // Verify updated Nike models in model dropdown
    const nikeOptions = await modelSelect.locator("option").allInnerTexts();
    console.log("[QA] Nike Model Options count:", nikeOptions.length);
    console.log("[QA] First 3 Nike options:", nikeOptions.slice(0, 3));
    const hasPanda = nikeOptions.some((o) => o.includes("Panda"));
    console.log("[QA] Contains Nike Panda:", hasPanda);
    if (!hasPanda) throw new Error("Nike models not populated after selecting Nike brand");

    // Select "Nike SB Dunk Low Travis Scott"
    await modelSelect.selectOption({ label: "Nike SB Dunk Low Travis Scott (MSRP: $150)" });
    await page.waitForTimeout(300);

    // Take screenshot of the Valuation Cockpit with the model dropdown active
    const cockpitElement = page.locator("text=VALUATION INPUT PARAMETERS").first();
    await cockpitElement.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const screenshotPath = path.join(REPORT_DIR, "dynamic_model_dropdown_cockpit.png");
    await page.screenshot({ path: screenshotPath });
    console.log(`[QA] Cockpit Screenshot saved: ${screenshotPath}`);

    // Click Calculate Resale Valuation
    const submitBtn = page.locator("button:has-text('CALCULATE RESALE VALUATION')");
    await submitBtn.click();
    await page.waitForTimeout(1000);

    // Verify result card appeared with verdict
    const hasVerdict = await page.locator("text=COP").first().isVisible() || await page.locator("text=DROP").first().isVisible();
    console.log("[QA] Resale Verdict Visible:", hasVerdict);

    const verdictScreenshotPath = path.join(REPORT_DIR, "valuation_result_with_dynamic_model.png");
    await page.screenshot({ path: verdictScreenshotPath });
    console.log(`[QA] Verdict Screenshot saved: ${verdictScreenshotPath}`);

  } finally {
    await browser.close();
  }

  if (errors.length > 0) {
    console.error("Browser Console Errors:", errors);
    process.exit(1);
  }
  console.log("PASS: Dynamic Sneaker Model Dropdown QA Passed Successfully!");
}

verifyModelDropdown().catch((err) => {
  console.error("QA failed:", err);
  process.exit(1);
});
