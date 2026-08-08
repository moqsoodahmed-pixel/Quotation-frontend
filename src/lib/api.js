// Thin wrapper around the quotation-history REST API.
const BASE = "/api/quotations";

export async function listQuotations() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Could not load history");
  return res.json();
}

export async function getQuotation(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error("Could not open that quotation");
  return res.json();
}

export async function getNextQuotationNumber() {
  const res = await fetch(`${BASE}/next-number`);
  if (!res.ok) throw new Error("Could not get the next quotation number");
  return res.json();
}

export async function saveQuotation(data, id = null) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, data }),
  });
  if (!res.ok) throw new Error("Could not save");
  return res.json();
}

export async function deleteQuotation(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Could not delete");
  return res.json();
}
