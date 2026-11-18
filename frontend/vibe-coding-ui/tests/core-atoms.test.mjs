import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const holoPath = path.resolve(__dirname, "../src/components/motion/HoloTiltCard.tsx");
const squigglyPath = path.resolve(__dirname, "../src/components/motion/SquigglyFilter.tsx");
const marqueePath = path.resolve(__dirname, "../src/components/motion/MarketMarquee.tsx");

assert(fs.existsSync(holoPath), "HoloTiltCard.tsx must exist");
const holo = fs.readFileSync(holoPath, "utf8");
assert(holo.includes("perspective"), "HoloTiltCard must define 3D perspective");
assert(holo.includes("rotateX"), "HoloTiltCard must track rotateX");
assert(holo.includes("rotateY"), "HoloTiltCard must track rotateY");
assert(holo.includes("radial-gradient"), "HoloTiltCard must render specular glare");
assert(holo.includes("translateZ(30px)"), "HoloTiltCard must elevate content along Z axis");

assert(fs.existsSync(squigglyPath), "SquigglyFilter.tsx must exist");
const squiggly = fs.readFileSync(squigglyPath, "utf8");
assert(squiggly.includes("feTurbulence"), "SquigglyFilter must declare feTurbulence");
assert(squiggly.includes("feDisplacementMap"), "SquigglyFilter must declare feDisplacementMap");
assert(squiggly.includes('id="squiggly-0"'), "SquigglyFilter must provide filter id squiggly-0");

assert(fs.existsSync(marqueePath), "MarketMarquee.tsx must exist");
const marquee = fs.readFileSync(marqueePath, "utf8");
assert(marquee.includes("animate-marquee") || marquee.includes("translateX"), "MarketMarquee must animate horizontally");

console.log("PASS: Task 2 Core Atoms verification passed");
