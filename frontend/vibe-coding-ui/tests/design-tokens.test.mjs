import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.resolve(__dirname, "../src/app/globals.css");
const cockpitPath = path.resolve(__dirname, "../src/components/ValuationCockpit.tsx");

const css = fs.readFileSync(cssPath, "utf8");
assert(css.includes("#09090b") || css.includes("#0c0c0e"), "globals.css must specify deep zinc pitch ground");
assert(css.includes("overflow-x: clip") || css.includes("overflow-x: hidden"), "Must prevent horizontal overflow");

const cockpit = fs.readFileSync(cockpitPath, "utf8");
assert(!cockpit.includes("indigo-600"), "Must purge indigo-600 in favor of Volt Lime / monochrome tokens");
assert(!cockpit.includes("purple-600"), "Must purge purple-600");

console.log("PASS: Task 5 Design Tokens verification passed");
