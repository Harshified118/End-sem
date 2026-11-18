import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadApiModule() {
  process.env.NEXT_PUBLIC_API_URL = "http://api.test";
  const source = fs.readFileSync(path.join(root, "src/lib/api.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const encoded = Buffer.from(outputText).toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

const payload = {
  brand: "Yeezy",
  retail_price: 220,
  shoe_size: 10,
  days_since_release: 120,
  threshold: 0.15,
};

const api = await loadApiModule();

globalThis.fetch = async () => {
  throw new TypeError("Failed to fetch");
};

assert.equal(typeof api.predictResaleOffline, "function", "Offline prediction must be directly callable");
assert.equal(typeof api.getFallbackBrandsResponse, "function", "Offline brand fallback must be reusable");

const fallback = await api.predictResale(payload);
assert.equal(fallback.is_estimate, true, "Network failures must produce a labelled offline estimate");
assert(fallback.estimated_resale_price > 0, "Offline estimate must contain a positive resale price");

globalThis.fetch = async () =>
  new Response(JSON.stringify({ detail: "Invalid retail price" }), {
    status: 422,
    headers: { "Content-Type": "application/json" },
  });

await assert.rejects(
  () => api.predictResale(payload),
  (error) => error.name === "ApiError" && error.message === "Invalid retail price",
  "Server validation errors must not be replaced by an offline estimate"
);

const page = fs.readFileSync(path.join(root, "src/app/page.tsx"), "utf8");
assert(page.includes('latest.status === "unreachable"'), "Health polling must stop when the API is unreachable");
assert(page.includes("didBootstrapRef"), "Initial data loading must be single-flight under Strict Mode");
assert(
  page.includes('healthRes.status === "unreachable"'),
  "Bootstrap must skip brand/history requests when the API is unreachable"
);
assert(
  page.includes('healthStatusRef.current === "unreachable"'),
  "Submission must use the offline path when the API is already known to be unreachable"
);
assert(page.includes("if (!res.is_estimate)"), "History refresh must be skipped for offline estimates");

console.log("PASS: offline fallback verification passed");
