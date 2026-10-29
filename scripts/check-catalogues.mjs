#!/usr/bin/env node
// Acceptance tests for per-company service catalogues.

let passed = 0;
let failed = 0;

function assert(cond, label) {
  if (cond) { console.log(`  ✓ ${label}`); passed++; }
  else { console.error(`  ✗ ${label}`); failed++; }
}

const { getCatalogue } = await import("../src/data/services/index.js");

const ld = getCatalogue("launcherdesk");
const dl = getCatalogue("dutylaunch");
const or = getCatalogue("officerestore");

// =========================================================================
console.log("\n=== LauncherDesk ===");
assert(ld.CATEGORY_ORDER.length === 27, `27 categories (got ${ld.CATEGORY_ORDER.length})`);
assert(ld.SERVICE_CATALOGUE.length === 81, `81 entries (got ${ld.SERVICE_CATALOGUE.length})`);
const ldEmpty = ld.CATEGORY_ORDER.filter((c) => !(ld.SERVICES_BY_CATEGORY[c]?.length > 0));
assert(ldEmpty.length === 0, `No empty categories${ldEmpty.length ? ": " + ldEmpty.join(", ") : ""}`);
// All IDs unique
const ldIds = ld.SERVICE_CATALOGUE.map((s) => s.id);
assert(new Set(ldIds).size === ldIds.length, "All IDs unique");

// =========================================================================
console.log("\n=== DutyLaunch ===");
assert(dl.CATEGORY_ORDER.length === 5, `5 categories (got ${dl.CATEGORY_ORDER.length})`);
assert(dl.SERVICE_CATALOGUE.length === 42, `42 entries (got ${dl.SERVICE_CATALOGUE.length})`);
const dlIds = dl.SERVICE_CATALOGUE.map((s) => s.id);
assert(new Set(dlIds).size === dlIds.length, "All IDs unique");

// =========================================================================
console.log("\n=== Office Restore ===");
assert(or.CATEGORY_ORDER.length === 5, `5 categories (got ${or.CATEGORY_ORDER.length})`);
assert(or.SERVICE_CATALOGUE.length === 22, `22 products (got ${or.SERVICE_CATALOGUE.length})`);

const expectedCounts = { Workstations: 3, "Office Chairs": 6, "Office Tables & Desks": 9, "Office Storage": 3, "Other Furniture": 1 };
for (const [cat, count] of Object.entries(expectedCounts)) {
  const ids = or.SERVICES_BY_CATEGORY[cat] || [];
  assert(ids.length === count, `${cat}: ${count} products (got ${ids.length})`);
}

// All IDs unique
const orIds = or.SERVICE_CATALOGUE.map((s) => s.id);
assert(new Set(orIds).size === orIds.length, "All IDs unique");

// Every entry has selling price < original price
const priceOk = or.SERVICE_CATALOGUE.every((s) => Number(s.price) < Number(s.originalPrice));
assert(priceOk, "selling price < original price for every entry");

// Exact prices
const expectedPrices = [
  ["Modern Office Workstation with Glass & Sandwich Partition", "4499", "5000"],
  ["Modular Office Workstation with Glass Partition", "2799", "3499"],
  ["4 to N Seater Modular Office Workstation", "2300", "3000"],
  ["Techno Company", "22000", "24000"],
  ["Humanscale Freedom Task Chair with Headrest", "26000", "30000"],
  ["Steelcase Think V2 with Headrest", "18000", "20000"],
  ["Executive High Back Office Chair", "4500", "5500"],
  ["Gaming Chair – Racing Style", "4799", "5799"],
  ["Ergonomic Mesh Office Chair", "3200", "3400"],
  ["Wooden Office Computer Desk with Storage", "4000", "4500"],
  ["Wooden Office Computer Desk", "3000", "3500"],
  ["Black Rolling Laptop Side Table", "1499", "2499"],
  ["Black Office Table", "3200", "3500"],
  ["Wooden Office Desk with Drawers & Cabinets", "6500", "7500"],
  ["Electric Height Adjustable Standing Desk", "14999", "15999"],
  ["Wooden Office Storage Cabinet with Lock", "5500", "6500"],
  ["Wooden Dressing Table with Mirror", "5000", "6000"],
];
let priceErrors = 0;
for (const [name, price, orig] of expectedPrices) {
  const entry = or.SERVICE_CATALOGUE.find((s) => s.name === name && s.price === price);
  if (!entry || entry.originalPrice !== orig) {
    console.error(`  ✗ ${name}: expected ${price}/${orig}, got ${entry?.price}/${entry?.originalPrice}`);
    priceErrors++;
  }
}
// Check the 3 White Office Work Tables
const whites = or.SERVICE_CATALOGUE.filter((s) => s.name === "White Office Work Table");
assert(whites.length === 3, `3 "White Office Work Table" entries (got ${whites.length})`);
const whitePrices = whites.map((s) => s.price).sort();
assert(whitePrices.join(",") === "2800,3200,3800", `White table prices: ${whitePrices.join(",")}`);
// Each has distinct ID
const whiteIds = whites.map((s) => s.id);
assert(new Set(whiteIds).size === 3, "White tables have distinct IDs");

// Check 2 Wooden Office Storage Cabinets
const cabinets = or.SERVICE_CATALOGUE.filter((s) => s.name === "Wooden Office Storage Cabinet");
assert(cabinets.length === 2, `2 "Wooden Office Storage Cabinet" entries (got ${cabinets.length})`);
const cabinetPrices = cabinets.map((s) => s.price).sort();
assert(cabinetPrices.join(",") === "4000,4500", `Cabinet prices: ${cabinetPrices.join(",")}`);
const cabinetIds = cabinets.map((s) => s.id);
assert(new Set(cabinetIds).size === 2, "Cabinets have distinct IDs");

assert(priceErrors === 0, `All unique-name prices exact (${priceErrors} errors)`);

// Duplicate display labels include price
const whiteLabels = whites.map((s) => s.displayLabel);
assert(whiteLabels.every(Boolean), "White tables have displayLabel");
assert(whiteLabels.every((l) => l.includes("₹")), "White table labels include ₹ price");

// =========================================================================
console.log("\n=== Cross-company isolation ===");
const orNames = new Set(or.SERVICE_CATALOGUE.map((s) => s.name));
const ldNames = new Set(ld.SERVICE_CATALOGUE.map((s) => s.name));
const dlNames = new Set(dl.SERVICE_CATALOGUE.map((s) => s.name));
const orCats = new Set(or.CATEGORY_ORDER);
const ldCats = new Set(ld.CATEGORY_ORDER);
const dlCats = new Set(dl.CATEGORY_ORDER);
const nameOverlap = [...orNames].filter((n) => ldNames.has(n) || dlNames.has(n));
const catOverlap = [...orCats].filter((c) => ldCats.has(c) || dlCats.has(c));
assert(nameOverlap.length === 0, `No shared names${nameOverlap.length ? ": " + nameOverlap.join(", ") : ""}`);
assert(catOverlap.length === 0, `No shared categories${catOverlap.length ? ": " + catOverlap.join(", ") : ""}`);

// =========================================================================
console.log("\n=== getCatalogue fallback ===");
assert(getCatalogue("unknown").SERVICE_CATALOGUE.length === 0, "Unknown company → empty");

console.log(`\n${"=".repeat(40)}`);
console.log(`PASSED: ${passed}   FAILED: ${failed}`);
if (failed > 0) process.exit(1);
