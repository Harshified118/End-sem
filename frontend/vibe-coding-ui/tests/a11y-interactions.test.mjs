import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const cockpit = read("src/components/ValuationCockpit.tsx");
assert(
  cockpit.includes("tabIndex={threshold === option.value ? 0 : -1}"),
  "Only the checked threshold radio belongs to the tab order"
);
assert(
  cockpit.includes('"ArrowRight"') && cockpit.includes('"ArrowLeft"'),
  "Threshold radios must support arrow-key navigation"
);

const header = read("src/components/Header.tsx");
assert(
  header.includes("aria-expanded={open && matches.length > 0}"),
  "Combobox must not claim an expanded listbox when there are no matches"
);
const listbox = header.match(/role="listbox"[\s\S]*?<\/ul>/)?.[0] ?? "";
assert(!listbox.includes("<button"), "Suggestion options must not nest focusable buttons inside the listbox");

const shoe = read("src/components/Shoe360.tsx");
assert(shoe.includes("reducedMotion ? null :"), "Auto-spin control must be hidden under reduced motion");
assert(
  /try\s*\{[\s\S]{0,120}setPointerCapture/.test(shoe),
  "Pointer capture must tolerate synthetic pointer events"
);

console.log("PASS: accessibility interactions verification passed");
