// Office Restore product catalogue — physical furniture.
// Each entry is a single product with a selling price and an original price.
// originalPrice is stored for future use; it is not displayed yet.

export const SERVICE_CATALOGUE = [
  // --- Workstations (3) ---
  { category: "Workstations", name: "Modern Office Workstation with Glass & Sandwich Partition", description: "", price: "4499", originalPrice: "5000" },
  { category: "Workstations", name: "Modular Office Workstation with Glass Partition", description: "", price: "2799", originalPrice: "3499" },
  { category: "Workstations", name: "4 to N Seater Modular Office Workstation", description: "", price: "2300", originalPrice: "3000" },

  // --- Office Chairs (6) ---
  { category: "Office Chairs", name: "Techno Company", description: "", price: "22000", originalPrice: "24000" }, // TODO: confirm full product name with owner
  { category: "Office Chairs", name: "Humanscale Freedom Task Chair with Headrest", description: "", price: "26000", originalPrice: "30000" },
  { category: "Office Chairs", name: "Steelcase Think V2 with Headrest", description: "", price: "18000", originalPrice: "20000" },
  { category: "Office Chairs", name: "Executive High Back Office Chair", description: "", price: "4500", originalPrice: "5500" },
  { category: "Office Chairs", name: "Gaming Chair – Racing Style", description: "", price: "4799", originalPrice: "5799" },
  { category: "Office Chairs", name: "Ergonomic Mesh Office Chair", description: "", price: "3200", originalPrice: "3400" },

  // --- Office Tables & Desks (9) ---
  { category: "Office Tables & Desks", name: "Wooden Office Computer Desk with Storage", description: "", price: "4000", originalPrice: "4500" },
  { category: "Office Tables & Desks", name: "Wooden Office Computer Desk", description: "", price: "3000", originalPrice: "3500" },
  { category: "Office Tables & Desks", name: "White Office Work Table", description: "", price: "2800", originalPrice: "3800" },
  { category: "Office Tables & Desks", name: "White Office Work Table", description: "", price: "3200", originalPrice: "4200" },
  { category: "Office Tables & Desks", name: "White Office Work Table", description: "", price: "3800", originalPrice: "4000" },
  { category: "Office Tables & Desks", name: "Wooden Office Desk with Drawers & Cabinets", description: "", price: "6500", originalPrice: "7500" },
  { category: "Office Tables & Desks", name: "Black Rolling Laptop Side Table", description: "", price: "1499", originalPrice: "2499" },
  { category: "Office Tables & Desks", name: "Black Office Table", description: "", price: "3200", originalPrice: "3500" },
  { category: "Office Tables & Desks", name: "Electric Height Adjustable Standing Desk", description: "", price: "14999", originalPrice: "15999" },

  // --- Office Storage (3) ---
  { category: "Office Storage", name: "Wooden Office Storage Cabinet", description: "", price: "4500", originalPrice: "5000" },
  { category: "Office Storage", name: "Wooden Office Storage Cabinet with Lock", description: "", price: "5500", originalPrice: "6500" },
  { category: "Office Storage", name: "Wooden Office Storage Cabinet", description: "", price: "4000", originalPrice: "5000" },

  // --- Other Furniture (1) ---
  { category: "Other Furniture", name: "Wooden Dressing Table with Mirror", description: "", price: "5000", originalPrice: "6000" },
];

export const SERVICES_BY_CATEGORY = SERVICE_CATALOGUE.reduce((acc, s) => {
  (acc[s.category] = acc[s.category] || []).push(s.name);
  return acc;
}, {});

export const CATEGORY_ORDER = [
  "Workstations",
  "Office Chairs",
  "Office Tables & Desks",
  "Office Storage",
  "Other Furniture",
];
