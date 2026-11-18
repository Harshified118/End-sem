import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(root, rel));

assert(exists("src/components/motion/HoloTiltCard.tsx"), "HoloTiltCard must exist");
const holo = read("src/components/motion/HoloTiltCard.tsx");
assert(holo.includes("perspective"), "HoloTiltCard needs perspective");
assert(holo.includes("rotateX") && holo.includes("rotateY"), "Pointer tilt on both axes");
assert(/\*\s*-?6\b/.test(holo), "Tilt must be capped near 6 degrees");
assert(!holo.includes("* 12"), "Old 12-degree tilt is too aggressive");
assert(holo.includes("preserve-3d"), "Tilt card must preserve 3d");
assert(holo.includes("radial-gradient"), "Specular glare required");

for (const removed of [
  "src/components/motion/MarketMarquee.tsx",
  "src/components/motion/SquigglyFilter.tsx",
  "src/components/motion/FrontShoeScrollRail.tsx",
  "src/components/motion/PinnedParallaxHero.tsx",
]) {
  assert(!exists(removed), `${removed} must be deleted in the redesign`);
}

console.log("PASS: 3D depth atoms verification passed");
