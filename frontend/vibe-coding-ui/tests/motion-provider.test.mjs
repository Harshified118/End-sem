import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.resolve(__dirname, "../package.json");
const providerPath = path.resolve(__dirname, "../src/components/motion/SmoothScrollProvider.tsx");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
assert(pkg.dependencies["lenis"], "Missing dependency 'lenis'");
assert(pkg.dependencies["gsap"], "Missing dependency 'gsap'");

assert(fs.existsSync(providerPath), "SmoothScrollProvider.tsx must exist");
const code = fs.readFileSync(providerPath, "utf8");
assert(code.includes('"use client"'), "Must be client component");
assert(code.includes("ScrollTrigger.update"), "Must bind Lenis scroll to ScrollTrigger.update");
assert(code.includes("gsap.ticker.add"), "Must hook Lenis into GSAP ticker");
assert(code.includes("lenis.destroy()"), "Must handle cleanup on unmount");

console.log("PASS: Task 1 Motion Provider verification passed");
