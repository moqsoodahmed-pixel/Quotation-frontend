const BACKEND = import.meta.env.VITE_API_URL || "";
const BASE = `${BACKEND}/api/quotations`;

function authHeaders() {
  const token = localStorage.getItem("ld_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
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

export async function listQuotations() {
  const res = await fetch(BASE, { headers: authHeaders() });
  if (res.status === 401) { logout(); window.location.reload(); }
  if (!res.ok) throw new Error("Could not load history");
  return res.json();
}

export async function getQuotation(id) {
  const res = await fetch(`${BASE}/${id}`, { headers: authHeaders() });
  if (res.status === 401) { logout(); window.location.reload(); }
  if (!res.ok) throw new Error("Could not open that quotation");
  return res.json();
}

export async function getNextQuotationNumber() {
  const res = await fetch(`${BASE}/next-number`, { headers: authHeaders() });
  if (res.status === 401) { logout(); window.location.reload(); }
  if (!res.ok) throw new Error("Could not get the next quotation number");
  return res.json();
}

export async function saveQuotation(data, id = null) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ id, data }),
  });
  if (res.status === 401) { logout(); window.location.reload(); }
  if (!res.ok) throw new Error("Could not save");
  return res.json();
}

export async function deleteQuotation(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 401) { logout(); window.location.reload(); }
  if (!res.ok) throw new Error("Could not delete");
  return res.json();
}
