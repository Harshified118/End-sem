import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const css = read("src/app/globals.css");
const design = read("DESIGN.md");

// Task 1 — token foundation
assert(css.includes('[data-theme="day"]'), "Day theme token block must exist");
for (const mapping of [
  "--color-canvas: var(--canvas)",
  "--color-surface: var(--surface)",
  "--color-ink-1: var(--ink-1)",
  "--color-accent: var(--accent)",
]) {
  assert(css.includes(mapping), `Theme must map semantic colors through variables: ${mapping}`);
}
for (const dayValue of [
  "#ffffff", "#f4f4f5", "#e4e4e7", "#3f6212", "#047857", "#e11d48",
]) {
  assert(css.includes(dayValue), `Day palette must include ${dayValue}`);
}
for (const utility of [
  "--color-accent-readable", "--color-cop-ink", "--color-drop-ink",
  "--shadow-card", "--header-border",
]) {
  assert(css.includes(utility), `Missing theme utility variable: ${utility}`);
}
assert(design.includes("Dark"), "DESIGN.md must document the Dark palette");
assert(design.includes("Day"), "DESIGN.md must document the Day palette");

// Task 2 — flash-free bootstrap
const layout = read("src/app/layout.tsx");
for (const fragment of [
  "suppressHydrationWarning",
  "droporcop-theme",
  'matchMedia("(prefers-color-scheme: dark)")',
  "document.documentElement.dataset.theme",
]) {
  assert(layout.includes(fragment), `Theme bootstrap must include: ${fragment}`);
}
assert(
  /<body[^>]*suppressHydrationWarning/.test(layout),
  "RootLayout body must have suppressHydrationWarning to prevent hydration mismatch from browser extensions"
);

// Task 3 — header control
assert(
  fs.existsSync(path.join(root, "src/components/ThemeToggle.tsx")),
  "ThemeToggle component must exist"
);
const toggle = read("src/components/ThemeToggle.tsx");
assert(/"use client"/.test(toggle), "ThemeToggle must be a client component");
for (const icon of ["Moon", "Sun"]) {
  assert(new RegExp(`\\b${icon}\\b`).test(toggle), `ThemeToggle must import ${icon} from lucide-react`);
}
for (const fragment of [
  'data-testid="theme-toggle"',
  'localStorage.setItem("droporcop-theme"',
  "document.documentElement.dataset.theme",
]) {
  assert(toggle.includes(fragment), `ThemeToggle must include: ${fragment}`);
}
const header = read("src/components/Header.tsx");
assert(header.includes("ThemeToggle"), "Header must import ThemeToggle");
assert(header.includes("<ThemeToggle />"), "Header must render ThemeToggle");
assert(
  /<header[^>]*className="[^"]*\bborder-b\b[^"]*\bborder-hairline\b/.test(header),
  "Header root must have a persistent bottom hairline"
);

// Task 4 — readable utilities in both themes
const tsxFiles = fs
  .readdirSync(path.join(root, "src"), { recursive: true })
  .filter((file) => file.endsWith(".tsx"));
for (const file of tsxFiles) {
  const source = read(path.join("src", file));
  const readable = /\btext-accent(?![-\w])/.test(source) || /\boutline-accent(?![-\w])/.test(source);
  assert(!readable, `${file} must use theme-readable accent text/focus utilities`);
  assert(!source.includes("text-canvas"), `${file} must use text-on-accent on filled actions`);
  assert(!/bg-(?:cop|drop) text-white/.test(source), `${file} must use readable ink on verdict fills`);
}

// Task 5 — mobile header stays usable with the added theme control
assert(
  header.includes('className="hidden sm:inline"'),
  "Model-status label must collapse below sm so the search input keeps usable width"
);
assert(
  !/focus-within:border-accent(?![-\w])/.test(header),
  "Search focus border must use the day-readable accent"
);
assert(
  header.includes("focus-within:border-accent-readable"),
  "Search focus border must use focus-within:border-accent-readable"
);

console.log("PASS: theme verification passed");
