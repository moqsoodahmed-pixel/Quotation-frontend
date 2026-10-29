import * as launcherdesk from "./launcherdesk.js";
import * as dutylaunch from "./dutylaunch.js";
import * as officerestore from "./officerestore.js";

const EMPTY = { SERVICE_CATALOGUE: [], SERVICES_BY_CATEGORY: {}, CATEGORY_ORDER: [], byId: {} };

function hydrate(companyId, raw) {
  const catalogue = raw.SERVICE_CATALOGUE.map((entry, i) => ({
    ...entry,
    id: `${companyId}:${i}`,
  }));

  // Count how many times each name appears within each category.
  const nameCount = {};
  for (const entry of catalogue) {
    const key = `${entry.category}\0${entry.name}`;
    nameCount[key] = (nameCount[key] || 0) + 1;
  }

  // For entries whose name appears more than once in the same category,
  // build a display label with the selling price so users can tell them apart.
  for (const entry of catalogue) {
    const key = `${entry.category}\0${entry.name}`;
    if (nameCount[key] > 1 && entry.price) {
      const formatted = Number(entry.price).toLocaleString("en-IN");
      entry.displayLabel = `${entry.name} – ₹${formatted}`;
    }
  }

  const byId = Object.fromEntries(catalogue.map((e) => [e.id, e]));

  // SERVICES_BY_CATEGORY maps category → array of ids (not names) for the dropdown.
  const servicesByCategory = {};
  for (const entry of catalogue) {
    (servicesByCategory[entry.category] = servicesByCategory[entry.category] || []).push(entry.id);
  }

  return {
    SERVICE_CATALOGUE: catalogue,
    SERVICES_BY_CATEGORY: servicesByCategory,
    CATEGORY_ORDER: raw.CATEGORY_ORDER,
    byId,
  };
}

const catalogues = {
  launcherdesk: hydrate("launcherdesk", launcherdesk),
  dutylaunch: hydrate("dutylaunch", dutylaunch),
  officerestore: hydrate("officerestore", officerestore),
};

export function getCatalogue(companyId) {
  return catalogues[companyId] || EMPTY;
}
