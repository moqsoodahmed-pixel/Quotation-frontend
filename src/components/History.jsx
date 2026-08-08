import { useEffect, useState } from "react";
import { listQuotations, deleteQuotation } from "../lib/api.js";

export default function History({ onOpen }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setItems(await listQuotations());
    } catch {
      setError("Couldn't load history — make sure the backend is running on port 4000.");
      setItems([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id, e) {
    e.stopPropagation();
    await deleteQuotation(id);
    load();
  }

  if (items === null) return <div className="history"><p className="note">Loading…</p></div>;

  return (
    <div className="history">
      <div className="history-head">
        <h2 className="section-title">History</h2>
        <button className="btn btn-soft" onClick={load}>Refresh</button>
      </div>

      {error && <p className="error-note">{error}</p>}

      {items.length === 0 && !error && (
        <p className="note">No saved quotations yet. Fill the form and hit Save.</p>
      )}

      <div className="history-list">
        {items.map((q) => (
          <div className="history-card" key={q.id} onClick={() => onOpen(q.id)}>
            <div className="history-main">
              <div className="history-title">
                {q.clientCompany || q.clientName || "Untitled client"}
                {q.quotationNo && <span className="history-no">· {q.quotationNo}</span>}
              </div>
              <div className="history-sub">{q.subject || "No subject"}</div>
              <div className="history-date">
                {new Date(q.savedAt).toLocaleString("en-GB")}
              </div>
            </div>
            <button
              className="btn-x"
              onClick={(e) => handleDelete(q.id, e)}
              aria-label="Delete quotation"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
