import { getCatalogue } from "../data/services/index.js";
import { COMPANIES } from "../data/company.js";

// --- small building blocks -------------------------------------------------
function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

function Section({ title, children, aside }) {
  return (
    <div className="section">
      <div className="section-head">
        <h2 className="section-title">{title}</h2>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, children }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

const PAYMENT_LABELS = [
  "Payment Terms",
  "Advance",
  "Ad Budget",
  "GST",
  "Proposal Validity",
  "Delivery Timeline",
  "Add-on services",
];

function hasMissingCompanyDetails(company) {
  const bd = company?.bankDetails || {};
  const sig = company?.defaultSignatory || {};
  return !bd.bankName || !bd.accountNumber || !bd.ifsc || !sig.name;
}

export default function QuotationForm({ data, update, uid, companyId, displayNo }) {
  const company = COMPANIES[companyId];
  const bankDetails = company?.bankDetails || {};
  const showDetailsBanner = hasMissingCompanyDetails(company);
  const { SERVICE_CATALOGUE, SERVICES_BY_CATEGORY, CATEGORY_ORDER, byId } = getCatalogue(companyId);
  const catalogueEmpty = SERVICE_CATALOGUE.length === 0;

  // ---- services ----
  function addService(name = "") {
    update((p) => ({
      services: [...p.services, { id: uid(), name, description: "", price: "" }],
    }));
  }
  function insertServiceFromCatalogue(entryId) {
    if (!entryId) return;
    const entry = byId[entryId];
    if (!entry) return;
    const fields = { name: entry.name, description: entry.description || "", price: entry.price || "" };
    update((p) => {
      const empty = p.services.findIndex((s) => !s.name);
      if (empty !== -1) {
        const copy = [...p.services];
        copy[empty] = { ...copy[empty], ...fields };
        return { services: copy };
      }
      return { services: [...p.services, { id: uid(), ...fields }] };
    });
  }
  function updateService(id, patch) {
    update((p) => ({
      services: p.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }
  function removeService(id) {
    update((p) => ({ services: p.services.filter((s) => s.id !== id) }));
  }

  // ---- third party ----
  function addTpRow() {
    update((p) => ({ thirdPartyRows: [...p.thirdPartyRows, { id: uid(), name: "", detail: "" }] }));
  }
  function updateTpRow(id, patch) {
    update((p) => ({
      thirdPartyRows: p.thirdPartyRows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }
  function removeTpRow(id) {
    update((p) => ({ thirdPartyRows: p.thirdPartyRows.filter((r) => r.id !== id) }));
  }

  // ---- payment terms ----
  function addTerm() {
    update((p) => ({ paymentTerms: [...p.paymentTerms, { id: uid(), label: "Payment Terms", value: "" }] }));
  }
  function updateTerm(id, patch) {
    update((p) => ({
      paymentTerms: p.paymentTerms.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }
  function removeTerm(id) {
    update((p) => ({ paymentTerms: p.paymentTerms.filter((t) => t.id !== id) }));
  }

  // Is the quotation number a preview hint or the real saved number?
  const isPreviewNo = displayNo && displayNo.startsWith("Will be");

  return (
    <div className="form">
      {showDetailsBanner && (
        <div className="warning-banner" style={{
          background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 6,
          padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#664d03",
        }}>
          <strong>{company?.name}</strong> has incomplete details (bank info or signatory).
          Update <code>src/data/company.js</code> before sending quotations.
        </div>
      )}
      {/* CLIENT DETAILS */}
      <Section title="Client details">
        <Field label="To (name / designation)">
          <input
            value={data.to}
            onChange={(e) => update({ to: e.target.value })}
            placeholder="Mr. Ramesh Kumar, Director"
          />
        </Field>
        <Field label="Company">
          <input
            value={data.company}
            onChange={(e) => update({ company: e.target.value })}
            placeholder="ABC Enterprises Pvt Ltd"
          />
        </Field>
        <Field label="Address / city">
          <input
            value={data.address}
            onChange={(e) => update({ address: e.target.value })}
            placeholder="Bengaluru, India"
          />
        </Field>
        <div className="row-2">
          <Field label="Date">
            <input type="date" value={data.date} onChange={(e) => update({ date: e.target.value })} />
          </Field>
          <Field label="Quotation No.">
            <input
              value={data.quotationNo || ""}
              readOnly
              className="readonly-field"
              title={data.quotationNo ? "" : displayNo}
            />
            {isPreviewNo && (
              <span className="field-hint" style={{ color: "#2b7de0" }}>{displayNo}</span>
            )}
          </Field>
        </div>
        <Field label="Subject">
          <textarea
            rows={2}
            value={data.subject}
            onChange={(e) => update({ subject: e.target.value })}
            placeholder="Proposal for … services — reg"
          />
        </Field>
      </Section>

      {/* ABOUT US */}
      <Section
        title="About us"
        aside={
          <Toggle checked={data.includeAbout} onChange={(v) => update({ includeAbout: v })}>
            Include section
          </Toggle>
        }
      >
        {data.includeAbout && (
          <Field label="About the company">
            <textarea
              rows={4}
              value={data.aboutText}
              onChange={(e) => update({ aboutText: e.target.value })}
              placeholder={`${company?.name || "Our company"} is a … helping startups with registrations, IT and finance.`}
            />
          </Field>
        )}
      </Section>

      {/* SERVICES & PRICING */}
      <Section title="Services & pricing">
        <div className="insert-bar">
          <select
            className="insert-select"
            value=""
            onChange={(e) => { insertServiceFromCatalogue(e.target.value); e.target.value = ""; }}
            disabled={catalogueEmpty}
          >
            <option value="">
              {catalogueEmpty
                ? `No catalogue yet for ${company?.name || "this company"} – use Add blank row`
                : "Insert service from catalogue…"}
            </option>
            {CATEGORY_ORDER.map((cat) => (
              <optgroup key={cat} label={cat}>
                {(SERVICES_BY_CATEGORY[cat] || []).map((id) => {
                  const e = byId[id];
                  return (
                    <option key={id} value={id}>
                      {e?.displayLabel || e?.name || id}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
          <button className="btn btn-soft" type="button" onClick={() => addService("")}>
            + Add blank row
          </button>
        </div>

        <div className="svc-list">
          {data.services.map((s, i) => (
            <div className="svc-row" key={s.id}>
              <div className="svc-index">{i + 1}</div>
              <div className="svc-fields">
                <input
                  className="svc-name"
                  value={s.name}
                  onChange={(e) => updateService(s.id, { name: e.target.value })}
                  placeholder="Service name"
                />
                <textarea
                  className="svc-desc"
                  rows={3}
                  value={s.description}
                  onChange={(e) => updateService(s.id, { description: e.target.value })}
                  placeholder="Short description / scope (optional) — package picks fill this in with an Includes list"
                />
                <input
                  className="svc-price"
                  value={s.price}
                  onChange={(e) => updateService(s.id, { price: e.target.value })}
                  placeholder="₹ Price"
                />
              </div>
              <button className="btn-x" type="button" onClick={() => removeService(s.id)} aria-label="Remove service">
                ✕
              </button>
            </div>
          ))}
        </div>

        <Toggle checked={data.showSavingsNote} onChange={(v) => update({ showSavingsNote: v })}>
          Show savings note
        </Toggle>
        {data.showSavingsNote && (
          <Field label="Savings note">
            <input
              value={data.savingsNote}
              onChange={(e) => update({ savingsNote: e.target.value })}
              placeholder="Annual plans offer savings of up to … compared to monthly."
            />
          </Field>
        )}
      </Section>

      {/* THIRD PARTY INTEGRATION */}
      <Section
        title="Third-party integration"
        aside={
          <Toggle checked={data.includeThirdParty} onChange={(v) => update({ includeThirdParty: v })}>
            Include section
          </Toggle>
        }
      >
        {data.includeThirdParty && (
          <>
            <div className="svc-list">
              {data.thirdPartyRows.map((r) => (
                <div className="tp-row" key={r.id}>
                  <input
                    value={r.name}
                    onChange={(e) => updateTpRow(r.id, { name: e.target.value })}
                    placeholder="Tool / platform"
                  />
                  <input
                    value={r.detail}
                    onChange={(e) => updateTpRow(r.id, { detail: e.target.value })}
                    placeholder="Note / who pays"
                  />
                  <button className="btn-x" type="button" onClick={() => removeTpRow(r.id)} aria-label="Remove row">
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button className="btn btn-soft" type="button" onClick={addTpRow}>
              + Add row
            </button>
          </>
        )}
      </Section>

      {/* OPTIONAL ADD-ON SERVICES */}
      <Section
        title="Optional add-on services"
        aside={
          <Toggle checked={data.includeAddOns} onChange={(v) => update({ includeAddOns: v })}>
            Include section
          </Toggle>
        }
      >
        {data.includeAddOns && (
          <Field label="Add-ons" hint="One per line">
            <textarea
              rows={5}
              value={data.addOns}
              onChange={(e) => update({ addOns: e.target.value })}
              placeholder={"AI Chatbot & WhatsApp Automation\nCRM Setup & Lead Automation\nLanding Page Development"}
            />
          </Field>
        )}
      </Section>

      {/* PAYMENT TERMS */}
      <Section title="Payment terms">
        <datalist id="payment-labels">
          {PAYMENT_LABELS.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
        <div className="svc-list">
          {data.paymentTerms.map((t) => (
            <div className="term-row" key={t.id}>
              <input
                className="term-label"
                list="payment-labels"
                value={t.label}
                onChange={(e) => updateTerm(t.id, { label: e.target.value })}
                placeholder="Label"
              />
              <input
                className="term-value"
                value={t.value}
                onChange={(e) => updateTerm(t.id, { value: e.target.value })}
                placeholder="Value"
              />
              <button className="btn-x" type="button" onClick={() => removeTerm(t.id)} aria-label="Remove term">
                ✕
              </button>
            </div>
          ))}
        </div>
        <button className="btn btn-soft" type="button" onClick={addTerm}>
          + Add row
        </button>
      </Section>

      {/* CONTACT & SIGNATURE */}
      <Section title="Contact & signature">
        <Field label="Company line">
          <input value={data.companyLine} onChange={(e) => update({ companyLine: e.target.value })} />
        </Field>
        <Toggle checked={data.showSignature} onChange={(v) => update({ showSignature: v })}>
          Show signature block
        </Toggle>
        <div className="row-2">
          <Field label="Signatory name">
            <input
              value={data.signatoryName}
              onChange={(e) => update({ signatoryName: e.target.value })}
              placeholder="Moqsood"
            />
          </Field>
          <Field label="Designation">
            <input
              value={data.designation}
              onChange={(e) => update({ designation: e.target.value })}
              placeholder="Managing Director"
            />
          </Field>
        </div>
        <p className="note">
          Download PDF builds a ready-to-send PDF directly. Download Word gives an editable .doc.
          Everything you save is stored in the database and appears under History.
        </p>
      </Section>

      {/* BANK DETAILS */}
      <Section
        title="Bank details"
        aside={
          <Toggle checked={data.includeBank} onChange={(v) => update({ includeBank: v })}>
            Include section
          </Toggle>
        }
      >
        {data.includeBank && (
          <>
            <p className="note">
              Bank details for <strong>{company?.name}</strong> — update them in{" "}
              <code>src/data/company.js</code> if they change.
            </p>
            <div className="bank-card">
              <div><strong>Account name:</strong> {bankDetails.accountName || "—"}</div>
              <div><strong>Bank name:</strong> {bankDetails.bankName || "—"}</div>
              <div><strong>Branch:</strong> {bankDetails.branch || "—"}</div>
              <div><strong>Account number:</strong> {bankDetails.accountNumber || "—"}</div>
              <div><strong>IFSC code:</strong> {bankDetails.ifsc || "—"}</div>
            </div>
          </>
        )}
      </Section>
    </div>
  );
}
