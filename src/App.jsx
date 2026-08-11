import { useRef, useState, useCallback, useEffect } from "react";
import QuotationForm from "./components/QuotationForm.jsx";
import QuotationPreview from "./components/QuotationPreview.jsx";
import History from "./components/History.jsx";
import Login from "./components/Login.jsx";
import { COMPANIES, DEFAULT_COMPANY_ID, DEFAULT_SIGNATORY } from "./data/company.js";
import { downloadPdf, downloadWord } from "./lib/download.js";
import {
  saveQuotation,
  getQuotation,
  getNextQuotationNumber,
  isLoggedIn,
  logout,
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
    aboutText: "",
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
    signatoryName: DEFAULT_SIGNATORY.name,
    designation: DEFAULT_SIGNATORY.designation,
    includeBank: true,
  };
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [companyId, setCompanyId] = useState(DEFAULT_COMPANY_ID);
  const [data, setData] = useState(() => blankQuotation(COMPANIES[DEFAULT_COMPANY_ID]));
  const [currentId, setCurrentId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [status, setStatus] = useState("");
  const previewRef = useRef(null);
  const numberRequestedOnMount = useRef(false);

  const update = useCallback((patch) => {
    setData((prev) => ({
      ...prev,
      ...(typeof patch === "function" ? patch(prev) : patch),
    }));
  }, []);

  const flash = (msg) => {
    setStatus(msg);
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setStatus(""), 2600);
  };

  const assignNextQuotationNumber = useCallback(async () => {
    try {
      const { quotationNo } = await getNextQuotationNumber();
      update({ quotationNo });
    } catch {
      flash("Couldn't reach the server for a quotation number.");
    }
  }, [update]);

  useEffect(() => {
    if (!loggedIn) return;
    if (numberRequestedOnMount.current) return;
    numberRequestedOnMount.current = true;
    assignNextQuotationNumber();
  }, [loggedIn, assignNextQuotationNumber]);

  async function handleSave() {
    try {
      const rec = await saveQuotation(data, currentId);
      setCurrentId(rec.id);
      flash("Saved to History");
    } catch {
      flash("Couldn't reach the server — save failed.");
    }
  }

  function handlePdf() {
    downloadPdf(previewRef.current, data);
  }

  function handleWord() {
    downloadWord(previewRef.current, data);
  }

  async function handleOpen(id) {
    try {
      const rec = await getQuotation(id);
      setData({ ...blankQuotation(COMPANIES[companyId]), ...rec.data });
      setCurrentId(rec.id);
      setShowHistory(false);
      flash("Loaded from History");
    } catch {
      flash("Couldn't open that quotation");
    }
  }

  function handleNew() {
    setData(blankQuotation(COMPANIES[companyId]));
    setCurrentId(null);
    setShowHistory(false);
    flash("Started a new quotation");
    assignNextQuotationNumber();
  }

  function handleSelectCompany(id) {
    setCompanyId(id);
    update({ companyLine: COMPANIES[id].companyLine });
  }

  function handleLogout() {
    logout();
    setLoggedIn(false);
    numberRequestedOnMount.current = false;
  }

  // Show login page if not authenticated
  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src="/logo.png" alt="LauncherDesk" className="brand-logo" />
          <div className="brand-divider" />
          <div className="brand-text">
            <span className="brand-title">Quotation Maker</span>
            <span className="brand-sub">{COMPANIES[companyId].tagline}</span>
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
          <History onOpen={handleOpen} />
        ) : (
          <div className="editor-grid">
            <section className="form-pane">
              <QuotationForm data={data} update={update} uid={uid} />
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
