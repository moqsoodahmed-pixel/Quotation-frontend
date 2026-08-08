import { useRef, useState, useCallback, useEffect } from "react";
import QuotationForm from "./components/QuotationForm.jsx";
import QuotationPreview from "./components/QuotationPreview.jsx";
import History from "./components/History.jsx";
import { COMPANY, DEFAULT_SIGNATORY } from "./data/company.js";
import { downloadPdf, downloadWord } from "./lib/download.js";
import { saveQuotation, getQuotation, getNextQuotationNumber } from "./lib/api.js";

let seq = 0;
const uid = () => `r${Date.now().toString(36)}${(seq++).toString(36)}`;

// A fresh, mostly-blank quotation. LauncherDesk branding is baked into the
// letterhead / contact defaults; client-specific fields start empty.
function blankQuotation() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    // Client details
    to: "",
    company: "",
    address: "",
    date: today,
    quotationNo: "",
    subject: "Proposal for ... services — reg",

    // About us
    includeAbout: true,
    aboutText: "",

    // Services & pricing (rows the user fills from the LauncherDesk catalogue)
    services: [{ id: uid(), name: "", description: "", price: "" }],
    showSavingsNote: false,
    savingsNote: "",

    // Third-party integration
    includeThirdParty: true,
    thirdPartyRows: [{ id: uid(), name: "", detail: "" }],

    // Optional add-on services (one per line)
    includeAddOns: true,
    addOns: "",

    // Payment terms
    paymentTerms: [
      { id: uid(), label: "Payment Terms", value: "" },
      { id: uid(), label: "GST", value: "" },
      { id: uid(), label: "Proposal Validity", value: "" },
    ],

    // Contact & signature (defaults from company config)
    companyLine: COMPANY.companyLine,
    showSignature: true,
    signatoryName: DEFAULT_SIGNATORY.name,
    designation: DEFAULT_SIGNATORY.designation,

    // Bank details
    includeBank: true,
  };
}

export default function App() {
  const [data, setData] = useState(blankQuotation);
  const [currentId, setCurrentId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [status, setStatus] = useState("");
  const previewRef = useRef(null);
  const numberRequestedOnMount = useRef(false);

  const update = useCallback((patch) => {
    setData((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }));
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
      flash("Couldn't reach the server for a quotation number — is the backend running on :4000?");
    }
  }, [update]);

  // Reserve the first quotation number as soon as the app loads. Guarded by
  // a ref (not just the effect dependency array) because React 18 StrictMode
  // double-invokes mount effects in development — without the guard this
  // would silently burn a second number on every load.
  useEffect(() => {
    if (numberRequestedOnMount.current) return;
    numberRequestedOnMount.current = true;
    assignNextQuotationNumber();
  }, [assignNextQuotationNumber]);

  async function handleSave() {
    try {
      const rec = await saveQuotation(data, currentId);
      setCurrentId(rec.id);
      flash("Saved to History");
    } catch {
      flash("Couldn't reach the server — is the backend running on :4000?");
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
      setData({ ...blankQuotation(), ...rec.data });
      setCurrentId(rec.id);
      setShowHistory(false);
      flash("Loaded from History");
    } catch {
      flash("Couldn't open that quotation");
    }
  }

  function handleNew() {
    setData(blankQuotation());
    setCurrentId(null);
    setShowHistory(false);
    flash("Started a new quotation");
    assignNextQuotationNumber();
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src="/logo.png" alt="LauncherDesk" className="brand-logo" />
          <div className="brand-divider" />
          <div className="brand-text">
            <span className="brand-title">Quotation Maker</span>
            <span className="brand-sub">{COMPANY.tagline}</span>
          </div>
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
                <QuotationPreview ref={previewRef} data={data} />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
