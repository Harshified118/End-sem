import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hero = read("src/components/Hero.tsx");
const rotator = read("src/components/Shoe360.tsx");

assert(hero.includes('"use client"'), "Hero must be a client component");
assert(rotator.includes("frame_") && rotator.includes("36"), "Hero must use the 36 WebP frames");
assert(hero.includes("ScrollTrigger"), "Parallax uses ScrollTrigger");
assert(!hero.includes("pin:"), "No pinned scroll-jack");
assert(hero.includes("opacity") && /\by:\s/.test(hero), "Parallax animates transform + opacity only");
assert(hero.includes("prefers-reduced-motion"), "Auto-spin and parallax must respect reduced motion");
assert(hero.includes('data-testid="hero-branch-left"'), "Left branch exists");
assert(hero.includes('data-testid="hero-branch-right"'), "Right branch exists");
assert(hero.includes('"Escape"'), "Escape closes branches");
assert(hero.includes("handleClickOutside") || hero.includes("mousedown"), "Outside click closes branches");
assert(hero.includes("Check profit"), "Exactly one CTA");
assert(hero.split("Check profit").length - 1 === 1, "Only one hero CTA");

console.log("PASS: hero + 360 + branch verification passed");
