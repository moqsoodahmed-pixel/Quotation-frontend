import { useRef, useState, useCallback, useEffect } from "react";
import QuotationForm from "./components/QuotationForm.jsx";
import QuotationPreview from "./components/QuotationPreview.jsx";
import History from "./components/History.jsx";
import Login from "./components/Login.jsx";
import { COMPANIES, DEFAULT_COMPANY_ID } from "./data/company.js";
import { downloadPdf, downloadWord } from "./lib/download.js";
import {
  saveQuotation,
  getQuotation,
  getNextQuotationNumber,
  isLoggedIn,
  logout,
  onSessionExpired,
} from "./lib/api.js";

let seq = 0;
const uid = () => `r${Date.now().toString(36)}${(seq++).toString(36)}`;

function blankQuotation(company) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    to: "",
    company: "",
    address: "",
    date: today,
    quotationNo: "",
    subject: "Proposal for ... services — reg",
    includeAbout: true,
    aboutText: company.aboutDefault || "",
    services: [{ id: uid(), name: "", description: "", price: "" }],
    showSavingsNote: false,
    savingsNote: "",
    includeThirdParty: true,
    thirdPartyRows: [{ id: uid(), name: "", detail: "" }],
    includeAddOns: true,
    addOns: "",
    paymentTerms: [
      { id: uid(), label: "Payment Terms", value: "" },
      { id: uid(), label: "GST", value: "" },
      { id: uid(), label: "Proposal Validity", value: "" },
    ],
    companyLine: company.companyLine,
    showSignature: true,
    signatoryName: company.defaultSignatory?.name || "",
    designation: company.defaultSignatory?.designation || "",
    includeBank: true,
    companyId: company.id,
  };
}

// Returns true if the user has typed anything beyond the blank template.
function hasUnsavedWork(data, companyId) {
  const blank = blankQuotation(COMPANIES[companyId]);
  return (
    data.to !== blank.to ||
    data.company !== blank.company ||
    data.address !== blank.address ||
    data.subject !== blank.subject ||
    (data.aboutText && data.aboutText !== blank.aboutText) ||
    data.services.some((s) => s.name || s.description || s.price) ||
    data.savingsNote ||
    data.thirdPartyRows.some((r) => r.name || r.detail) ||
    data.addOns ||
    data.paymentTerms.some((t) => t.value)
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState("");
  const [companyId, setCompanyId] = useState(DEFAULT_COMPANY_ID);
  const [data, setData] = useState(() => blankQuotation(COMPANIES[DEFAULT_COMPANY_ID]));
  const [currentId, setCurrentId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [status, setStatus] = useState("");
  const [numberPreview, setNumberPreview] = useState("");
  const [dirty, setDirty] = useState(false);
  const previewRef = useRef(null);
  const numberFetchRef = useRef(null); // abort controller for deduplication

  // Wire up 401 handler — clears auth and shows message instead of hard reload.
  useEffect(() => {
    onSessionExpired(() => {
      setLoggedIn(false);
      setSessionExpiredMsg("Session expired — please sign in again.");
    });
  }, []);

  const update = useCallback((patch) => {
    setData((prev) => ({
      ...prev,
      ...(typeof patch === "function" ? patch(prev) : patch),
    }));
    setDirty(true);
  }, []);

  const flash = (msg) => {
    setStatus(msg);
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setStatus(""), 2600);
  };

  // Fetch next-number preview. Debounced via AbortController to prevent double-fire.
  const refreshNumberPreview = useCallback(async (forCompanyId) => {
    if (numberFetchRef.current) numberFetchRef.current.abort();
    const ctrl = new AbortController();
    numberFetchRef.current = ctrl;
    try {
      const { quotationNo } = await getNextQuotationNumber(forCompanyId);
      if (!ctrl.signal.aborted) {
        setNumberPreview(quotationNo);
      }
    } catch {
      if (!ctrl.signal.aborted) {
        setNumberPreview("");
        flash("Couldn't reach the server for a quotation number.");
      }
    }
  }, []);

  // Fetch number preview on login.
  useEffect(() => {
    if (!loggedIn) return;
    refreshNumberPreview(companyId);
  }, [loggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  function confirmIfDirty(msg) {
    if (!dirty || !hasUnsavedWork(data, companyId)) return true;
    return window.confirm(msg || "You have unsaved changes. Continue?");
  }

  async function handleSave() {
    try {
      const rec = await saveQuotation(data, companyId, currentId);
      setCurrentId(rec.id);
      // Server assigns the real quotation number on first save.
      if (rec.data?.quotationNo) {
        setData((prev) => ({ ...prev, quotationNo: rec.data.quotationNo }));
      }
      setDirty(false);
      flash("Saved to History");
      // Refresh the preview for the next new quotation.
      refreshNumberPreview(companyId);
    } catch {
      flash("Couldn't reach the server — save failed.");
    }
  }

  async function handlePdf() {
    if (dirty && hasUnsavedWork(data, companyId)) {
      if (!window.confirm("Save before downloading? Click OK to save first, or Cancel to download without saving.")) {
        downloadPdf(previewRef.current, data, companyId);
        return;
      }
      await handleSave();
    }
    downloadPdf(previewRef.current, data, companyId);
  }

  async function handleWord() {
    if (dirty && hasUnsavedWork(data, companyId)) {
      if (!window.confirm("Save before downloading? Click OK to save first, or Cancel to download without saving.")) {
        downloadWord(previewRef.current, data, companyId);
        return;
      }
      await handleSave();
    }
    downloadWord(previewRef.current, data, companyId);
  }

  async function handleOpen(id) {
    if (!confirmIfDirty("You have unsaved changes. Open this quotation anyway?")) return;
    try {
      const rec = await getQuotation(id);
      const recCompanyId = rec.companyId || rec.data?.companyId || companyId;
      const company = COMPANIES[recCompanyId] || COMPANIES[DEFAULT_COMPANY_ID];
      setCompanyId(recCompanyId);
      setData({ ...blankQuotation(company), ...rec.data, companyId: recCompanyId });
      setCurrentId(rec.id);
      setShowHistory(false);
      setDirty(false);
      flash("Loaded from History");
      refreshNumberPreview(recCompanyId);
    } catch {
      flash("Couldn't open that quotation");
    }
  }

  function handleNew() {
    if (!confirmIfDirty("You have unsaved changes. Start a new quotation?")) return;
    const company = COMPANIES[companyId];
    setData(blankQuotation(company));
    setCurrentId(null);
    setShowHistory(false);
    setDirty(false);
    flash("Started a new quotation");
    refreshNumberPreview(companyId);
  }

  function handleSelectCompany(id) {
    if (id === companyId) return;
    if (!confirmIfDirty("Switching tabs will change the letterhead and bank details. Continue?")) return;
    const newCompany = COMPANIES[id];
    setCompanyId(id);
    // Keep client details; swap company-specific fields.
    setData((prev) => {
      const aboutEdited = prev.aboutText && prev.aboutText !== (COMPANIES[companyId]?.aboutDefault || "");
      return {
        ...prev,
        companyLine: newCompany.companyLine,
        signatoryName: newCompany.defaultSignatory?.name || "",
        designation: newCompany.defaultSignatory?.designation || "",
        aboutText: aboutEdited ? prev.aboutText : (newCompany.aboutDefault || ""),
        companyId: id,
        // Clear the old number — will be re-previewed for the new company.
        quotationNo: "",
      };
    });
    // If this was a saved quotation, detach so next save creates a new one under the new company.
    setCurrentId(null);
    setDirty(true);
    refreshNumberPreview(id);
  }

  function handleLogout() {
    logout();
    setLoggedIn(false);
    setDirty(false);
  }

  // Show login page if not authenticated.
  if (!loggedIn) {
    return (
      <Login
        onLogin={() => {
          setSessionExpiredMsg("");
          setLoggedIn(true);
        }}
        message={sessionExpiredMsg}
      />
    );
  }

  const company = COMPANIES[companyId];
  const displayNo = data.quotationNo || (numberPreview ? `Will be assigned as ${numberPreview} on save` : "");

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src={company.logo} alt={company.name} className="brand-logo" />
          <div className="brand-divider" />
          <div className="brand-text">
            <span className="brand-title">Quotation Maker</span>
            <span className="brand-sub">{company.tagline || company.name}</span>
          </div>
        </div>

        <div className="company-switcher">
          {Object.values(COMPANIES).map((c) => (
            <button
              key={c.id}
              className={`company-tab${c.id === companyId ? " active" : ""}`}
              onClick={() => handleSelectCompany(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="topbar-actions">
          {status && <span className="status-pill">{status}</span>}
          <button className="btn btn-ghost" onClick={handleNew}>New</button>
          <button
            className="btn btn-ghost"
            onClick={() => setShowHistory((v) => !v)}
          >
            {showHistory ? "Close History" : "History"}
          </button>
          <button className="btn btn-outline" onClick={handleWord}>Download Word</button>
          <button className="btn btn-primary" onClick={handlePdf}>Download PDF</button>
          <button className="btn btn-accent" onClick={handleSave}>Save</button>
          <button className="btn btn-ghost" onClick={handleLogout}
            style={{ borderLeft: "1px solid #ddd", marginLeft: 4, paddingLeft: 12 }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="workspace">
        {showHistory ? (
          <History onOpen={handleOpen} activeCompanyId={companyId} />
        ) : (
          <div className="editor-grid">
            <section className="form-pane">
              <QuotationForm
                data={data}
                update={update}
                uid={uid}
                companyId={companyId}
                displayNo={displayNo}
              />
            </section>
            <section className="preview-pane">
              <div className="preview-scale">
                <QuotationPreview ref={previewRef} data={data} companyId={companyId} />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
