const BACKEND = import.meta.env.VITE_API_URL || "";

if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  console.error(
    "[api] VITE_API_URL is not set. Create a .env file with VITE_API_URL=http://localhost:4000 " +
    "(see .env.example). API calls will go to the dev-server proxy if configured."
  );
}

const BASE = `${BACKEND}/api/quotations`;

function authHeaders() {
  const token = localStorage.getItem("ld_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Callbacks set by the app so a 401 can clear auth state without page reload.
let _onSessionExpired = null;
export function onSessionExpired(cb) {
  _onSessionExpired = cb;
}

function handle401() {
  localStorage.removeItem("ld_token");
  if (_onSessionExpired) {
    _onSessionExpired();
  } else {
    window.location.reload();
  }
}

export async function login(username, password) {
  const res = await fetch(`${BACKEND}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  const { token } = await res.json();
  localStorage.setItem("ld_token", token);
}

export function logout() {
  localStorage.removeItem("ld_token");
}

export function isLoggedIn() {
  return !!localStorage.getItem("ld_token");
}

// List quotations — optional company filter and search query.
export async function listQuotations({ company, q } = {}) {
  const params = new URLSearchParams();
  if (company) params.set("company", company);
  if (q) params.set("q", q);
  const qs = params.toString();
  const url = qs ? `${BASE}?${qs}` : BASE;
  const res = await fetch(url, { headers: authHeaders() });
  if (res.status === 401) { handle401(); return []; }
  if (!res.ok) throw new Error("Could not load history");
  return res.json();
}

export async function getQuotation(id) {
  const res = await fetch(`${BASE}/${id}`, { headers: authHeaders() });
  if (res.status === 401) { handle401(); return; }
  if (!res.ok) throw new Error("Could not open that quotation");
  return res.json();
}

// Preview next quotation number (does not consume it).
export async function getNextQuotationNumber(companyId) {
  const res = await fetch(`${BASE}/next-number?company=${encodeURIComponent(companyId)}`, {
    headers: authHeaders(),
  });
  if (res.status === 401) { handle401(); return; }
  if (!res.ok) throw new Error("Could not get the next quotation number");
  return res.json();
}

// Save (create or update).  The server assigns the real number on first save.
export async function saveQuotation(data, companyId, id = null) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ id, companyId, data }),
  });
  if (res.status === 401) { handle401(); return; }
  if (!res.ok) throw new Error("Could not save");
  return res.json();
}

export async function deleteQuotation(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 401) { handle401(); return; }
  if (!res.ok) throw new Error("Could not delete");
  return res.json();
}

// Duplicate an existing quotation, optionally under a different company.
export async function duplicateQuotation(id, targetCompanyId) {
  const res = await fetch(`${BASE}/${id}/duplicate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ companyId: targetCompanyId }),
  });
  if (res.status === 401) { handle401(); return; }
  if (!res.ok) throw new Error("Could not duplicate");
  return res.json();
}
