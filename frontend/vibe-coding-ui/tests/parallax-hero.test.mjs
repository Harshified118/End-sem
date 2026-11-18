import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const heroPath = path.resolve(__dirname, "../src/components/motion/PinnedParallaxHero.tsx");

assert(fs.existsSync(heroPath), "PinnedParallaxHero.tsx must exist");
const code = fs.readFileSync(heroPath, "utf8");
assert(code.includes('"use client"'), "Must be client component");
assert(code.includes("ScrollTrigger"), "Must import ScrollTrigger");
assert(code.includes("pin: true"), "Hero must be pinned during scroll scrub");
assert(code.includes("scrub:"), "Hero animation must scrub with scroll position");
assert(code.includes("scale"), "Product visual must scale on scroll");

console.log("PASS: Task 3 Pinned Parallax Hero verification passed");
