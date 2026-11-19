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
assert(watchlist.includes("Profit"), "Card badge explicitly mentions Profit");
assert(watchlist.includes('id="wishlist-section"'), "Section must have id='wishlist-section'");
assert(watchlist.includes("Popular Sneaker Wishlist"), "Section heading must be 'Popular Sneaker Wishlist'");
assert(
  watchlist.includes("sneaker.spriteId || sneaker.id") || watchlist.includes("spriteId"),
  "Wishlist images must fallback to spriteId to prevent 404 on missing hero assets"
);

const sneakers = read("src/lib/sneakers.ts");
const firstSixMatches = [...sneakers.matchAll(/id:\s*"([^"]+)"/g)].slice(0, 6).map((m) => m[1]);
const uniqueFirstSix = new Set(firstSixMatches);
assert.equal(uniqueFirstSix.size, 6, "First 6 wishlist shoes must have distinct IDs");
assert(!firstSixMatches.includes("nike-travis-dunk"), "Duplicated dunk sprites must not be in the first 6 wishlist items");

console.log("PASS: watchlist verification passed");
