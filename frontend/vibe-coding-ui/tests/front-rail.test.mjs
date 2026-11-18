import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const railPath = path.resolve(__dirname, "../src/components/motion/FrontShoeScrollRail.tsx");

assert(fs.existsSync(railPath), "FrontShoeScrollRail.tsx must exist");
const code = fs.readFileSync(railPath, "utf8");
assert(code.includes("scroll-snap-type: x mandatory") || code.includes("snap-x"), "Must use CSS scroll snap");
assert(code.includes("data-lenis-prevent"), "Must isolate horizontal swipe from vertical Lenis scroll");
assert(code.includes("HoloTiltCard"), "Showcase cards must wrap in HoloTiltCard");
assert(code.includes("onSelectSneaker"), "Must provide onSelectSneaker callback");

console.log("PASS: Task 4 Front Shoe Scroll Rail verification passed");
