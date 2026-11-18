import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const provider = read("src/components/motion/SmoothScrollProvider.tsx");
assert(provider.includes('"use client"'), "Motion provider must be a client component");
assert(provider.includes("new Lenis"), "Lenis must drive scroll");
assert(provider.includes("ScrollTrigger.update"), "Lenis must update ScrollTrigger");
assert(provider.includes("gsap.ticker.add"), "Lenis must run on the GSAP ticker");
assert(provider.includes("lenis.destroy()"), "Lenis must be cleaned up");
assert(provider.includes("prefers-reduced-motion"), "Reduced motion must disable smooth scrolling");

const css = read("src/app/globals.css");
assert(css.includes("@media (prefers-reduced-motion: reduce)"), "CSS reduced-motion clause required");
assert(/animation-duration:\s*0\.01ms/.test(css), "Reduced motion must collapse animations");

const allSource = fs
  .readdirSync(path.join(root, "src"), { recursive: true })
  .filter((f) => /\.(tsx|ts|css)$/.test(f))
  .map((f) => read(path.join("src", f)))
  .join("\n");

assert(!allSource.includes("pin: true"), "Scroll-jacking pin is banned");
assert(!allSource.includes("animate-marquee"), "Marquee is banned");
assert(
  !/gsap\.(to|from|fromTo)\([\s\S]{0,400}?\b(width|height|margin)\s*:/.test(allSource),
  "GSAP must animate transform/opacity only, never layout properties"
);

console.log("PASS: motion provider + reduced-motion verification passed");
