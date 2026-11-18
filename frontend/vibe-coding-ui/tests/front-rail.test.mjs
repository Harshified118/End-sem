import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const watchlist = read("src/components/Watchlist.tsx");

assert(watchlist.includes("HoloTiltCard"), "Watchlist cards use perspective tilt");
assert(watchlist.includes("REFERENCE_SNEAKERS"), "Watchlist uses the single sneaker catalogue");
assert(/slice\(0,\s*6\)/.test(watchlist), "Watchlist shows at most six cards");
assert(watchlist.includes("stagger={0.06}"), "Cards stagger by 60ms");
assert(watchlist.includes("onSelectSneaker"), "Card click loads the calculator");
assert(!watchlist.includes("ShoeRotator360"), "Watchlist cards stay calm: no per-card rotator");
assert(watchlist.includes("retail"), "Card shows retail price");

console.log("PASS: watchlist verification passed");
