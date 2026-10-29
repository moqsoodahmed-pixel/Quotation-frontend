import { useEffect, useState, useRef, useCallback } from "react";
import { listQuotations, deleteQuotation, duplicateQuotation } from "../lib/api.js";
import { COMPANIES } from "../data/company.js";

const COMPANY_FILTERS = [
  { value: "", label: "All" },
  { value: "launcherdesk", label: "LauncherDesk" },
  { value: "dutylaunch", label: "DutyLaunch" },
  { value: "officerestore", label: "Office Restore" },
];

export default function History({ onOpen, activeCompanyId }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [filterCompany, setFilterCompany] = useState(activeCompanyId || "");
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setError("");
      const params = {};
      if (filterCompany) params.company = filterCompany;
      if (searchQuery) params.q = searchQuery;
      setItems(await listQuotations(params));
    } catch (err) {
      setError(err?.message || "Couldn't load history.");
      setItems([]);
    }
  }, [filterCompany, searchQuery]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce search input → searchQuery (300ms).
  function handleSearchChange(value) {
    setSearchText(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(value), 300);
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm("Delete this quotation? This can't be undone.")) return;
    try {
      await deleteQuotation(id);
      load();
    } catch (err) {
      setError(err?.message || "Delete failed.");
    }
  }

  async function handleDuplicate(id, e) {
    e.stopPropagation();
    try {
      const rec = await duplicateQuotation(id);
      if (rec?.id) {
        load();
        // Open the duplicate immediately.
        onOpen(rec.id);
      }
    } catch (err) {
      setError(err?.message || "Duplicate failed.");
    }
  }

  if (items === null) return <div className="history"><p className="note">Loading…</p></div>;

  return (
    <div className="history">
      <div className="history-head">
        <h2 className="section-title">History</h2>
        <button className="btn btn-soft" onClick={load}>Refresh</button>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="history-filter-tabs">
          {COMPANY_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`company-tab${filterCompany === f.value ? " active" : ""}`}
              onClick={() => setFilterCompany(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="history-search"
          type="search"
          placeholder="Search quotations…"
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {error && <p className="error-note">{error}</p>}

      {items.length === 0 && !error && (
        <p className="note">No saved quotations yet. Fill the form and hit Save.</p>
      )}

      <div className="history-list">
        {items.map((q) => {
          const co = COMPANIES[q.companyId];
          return (
            <div className="history-card" key={q.id} onClick={() => onOpen(q.id)}>
              <div className="history-main">
                <div className="history-title">
                  {q.clientCompany || q.clientName || "Untitled client"}
                  {q.quotationNo && <span className="history-no">· {q.quotationNo}</span>}
                  {co && <span className="history-badge">{co.name}</span>}
                </div>
                <div className="history-sub">{q.subject || "No subject"}</div>
                <div className="history-date">
                  {new Date(q.savedAt).toLocaleString("en-GB")}
                </div>
              </div>
              <div className="history-actions">
                <button
                  className="btn btn-soft btn-sm"
                  onClick={(e) => handleDuplicate(q.id, e)}
                  title="Duplicate"
                >
                  ⧉
                </button>
                <button
                  className="btn-x"
                  onClick={(e) => handleDelete(q.id, e)}
                  aria-label="Delete quotation"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
