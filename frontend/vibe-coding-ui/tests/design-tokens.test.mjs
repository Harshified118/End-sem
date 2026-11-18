import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const css = read("src/app/globals.css");
for (const token of [
  "--canvas: #09090b",
  "--surface: #121215",
  "--inset: #09090b",
  "--accent: #bef264",
  "--cop: #10b981",
  "--drop: #f43f5e",
  "--warn: #f59e0b",
  "--ink-1: #f4f4f5",
  "--ink-2: #d4d4d8",
  "--ink-3: #a1a1aa",
  "--ink-4: #71717a",
  "--text-12", "--text-14", "--text-16", "--text-18", "--text-22", "--text-28", "--text-40",
  "--radius-card", "--radius-panel",
]) {
  assert(css.includes(token), `Missing design token: ${token}`);
}
assert(css.includes("overflow-x: clip"), "No horizontal scroll");

const allFiles = fs
  .readdirSync(path.join(root, "src"), { recursive: true })
  .filter((f) => /\.(tsx|ts|css)$/.test(f));
const source = allFiles.map((f) => read(path.join("src", f))).join("\n");

for (const banned of [
  "#a3e635", "marquee", "Quick Presets", "Phase 4", "VALUATION INPUT PARAMETERS",
  "Arbitrage Appraisal", "Live Valuation Stage", "94,355", "Resale Spreads",
  "Reference snapshot", "MSRP", "holding period", "Holding Period", "arbitrage appraisal",
  "text-xs", "slate-", "(DROPDOWN)", "Calculate Resale Valuation", "spin-ping",
]) {
  assert(!source.toLowerCase().includes(banned.toLowerCase()), `Banned copy/style: ${banned}`);
}

const disclaimer = "Estimates from a model trained on Yeezy & Off-White StockX sales. Not financial advice.";
assert(source.split(disclaimer).length - 1 === 1, "Disclaimer must appear exactly once");

for (const required of [
  "0.6271", "89.38", "19,938", "days since release", "past checks", "model info", "verdict",
  "Buy if profit ≥", "Extrapolated", "Demo mode",
]) {
  assert(source.includes(required), `Missing required copy/data: ${required}`);
}

const design = read("DESIGN.md");
assert(design.includes("Motion rules"), "DESIGN.md must document motion");
assert(design.includes("Reduced motion"), "DESIGN.md must document the reduced-motion clause");
assert(design.includes("#bef264"), "DESIGN.md must carry the token table");

console.log("PASS: design tokens + copy verification passed");
