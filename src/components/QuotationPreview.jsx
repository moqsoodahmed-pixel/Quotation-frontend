import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { COMPANIES, DEFAULT_COMPANY_ID, BANK_DETAILS } from "../data/company.js";

// A4 @96dpi, matching the .doc-page CSS below. Header/footer heights are
// derived from the letterhead artwork's fixed aspect ratio (2482x438 and
// 2482x548) at that page width, so a page's usable body height is whatever
// is left after the letterhead bands and body padding.
const PAGE_W = 794;
const PAGE_H = 1123;
const HEADER_H = Math.round(PAGE_W / (2482 / 438));
const FOOTER_H = Math.round(PAGE_W / (2482 / 548));
const BODY_PAD_V = 22 + 26;
const BODY_BUDGET = PAGE_H - HEADER_H - FOOTER_H - BODY_PAD_V - 12; // safety margin
const BODY_CONTENT_W = PAGE_W - 40 * 2;

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function parseAmount(str) {
  const n = Number(String(str).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function inr(n) {
  return "₹ " + n.toLocaleString("en-IN");
}

// Renders text with real <br/> line breaks (not CSS white-space, which
// Word's HTML import doesn't honour reliably) — used for package "Includes"
// lists in the services table.
function MultiLine({ text }) {
  const lines = String(text || "").split("\n");
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ));
}

const SVC_THEAD_CONTENT = (
  <tr>
    <th className="c-no">#</th>
    <th>Service</th>
    <th>Description</th>
    <th className="c-amt">Amount</th>
  </tr>
);

// Measures real content once per render (hidden, same width as a live page)
// and greedily packs it into fixed-height A4 pages. "Block" units (About Us,
// Payment Terms, signature, ...) are measured by diffing consecutive
// offsetTops so CSS margins are captured correctly; service rows/total are
// plain table rows (no margins involved) so a direct height read is enough.
// A page that continues the services table mid-way pays for a repeated
// <thead> out of its budget.
function usePaginatedBody(units, budgetPx, theadHeightFallback) {
  const blockContainerRef = useRef(null);
  const blockRefs = useRef({});
  const svcTheadRef = useRef(null);
  const svcRowRefs = useRef({});
  const [pageGroups, setPageGroups] = useState(() => [units]);

  useLayoutEffect(() => {
    const blockUnits = units.filter((u) => u.kind !== "svc-row" && u.kind !== "svc-total");
    const svcUnits = units.filter((u) => u.kind === "svc-row" || u.kind === "svc-total");

    const blockHeights = {};
    const blockContainer = blockContainerRef.current;
    if (blockContainer) {
      const containerTop = blockContainer.getBoundingClientRect().top;
      const tops = blockUnits.map((u) => {
        const el = blockRefs.current[u.key];
        return el ? el.getBoundingClientRect().top - containerTop : 0;
      });
      const totalHeight = blockContainer.scrollHeight;
      blockUnits.forEach((u, i) => {
        const next = i + 1 < blockUnits.length ? tops[i + 1] : totalHeight;
        blockHeights[u.key] = Math.max(0, next - tops[i]);
      });
    }

    const svcHeights = {};
    svcUnits.forEach((u) => {
      const el = svcRowRefs.current[u.key];
      svcHeights[u.key] = el ? el.getBoundingClientRect().height : 0;
    });
    const theadHeight = svcTheadRef.current ? svcTheadRef.current.getBoundingClientRect().height : theadHeightFallback;

    const groups = [];
    let current = [];
    let used = 0;
    let theadCountedOnThisPage = false;

    units.forEach((u) => {
      const isSvcRow = u.kind === "svc-row" || u.kind === "svc-total";
      let h = isSvcRow ? svcHeights[u.key] || 0 : blockHeights[u.key] || 0;
      let extra = 0;
      if (isSvcRow && !theadCountedOnThisPage) extra = theadHeight;

      if (current.length > 0 && used + extra + h > budgetPx) {
        groups.push(current);
        current = [];
        used = 0;
        theadCountedOnThisPage = false;
        extra = isSvcRow ? theadHeight : 0;
      }
      if (isSvcRow) theadCountedOnThisPage = true;
      current.push(u);
      used += extra + h;
    });
    groups.push(current);

    setPageGroups((prev) => {
      const sameShape =
        prev.length === groups.length &&
        prev.every((g, gi) => g.length === groups[gi].length && g.every((u, ui) => u.key === groups[gi][ui].key));
      return sameShape ? prev : groups;
    });
  }, [units, budgetPx, theadHeightFallback]);

  return { blockContainerRef, blockRefs, svcTheadRef, svcRowRefs, pageGroups };
}

// Groups a page's units so consecutive svc-row/svc-total units share one
// <table> (with the column header repeated), while every other unit renders
// as its own block.
function renderPageBody(units) {
  const out = [];
  let svcBuffer = [];
  const flushSvc = (flushKey) => {
    if (svcBuffer.length === 0) return;
    out.push(
      <table className="tbl" key={`svc-table-${flushKey}`}>
        <thead>{SVC_THEAD_CONTENT}</thead>
        <tbody>{svcBuffer.filter((u) => u.kind === "svc-row").map((u) => u.node)}</tbody>
        {svcBuffer.some((u) => u.kind === "svc-total") && (
          <tfoot>{svcBuffer.filter((u) => u.kind === "svc-total").map((u) => u.node)}</tfoot>
        )}
      </table>
    );
    svcBuffer = [];
  };

  units.forEach((u) => {
    if (u.kind === "svc-row" || u.kind === "svc-total") {
      svcBuffer.push(u);
    } else {
      flushSvc(u.key);
      out.push(u.node);
    }
  });
  flushSvc("end");
  return out;
}

const QuotationPreview = forwardRef(function QuotationPreview({ data, companyId }, ref) {
  const company = COMPANIES[companyId] || COMPANIES[DEFAULT_COMPANY_ID];
  const total = data.services.reduce((sum, s) => sum + parseAmount(s.price), 0);
  const addOnLines = (data.addOns || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const terms = data.paymentTerms;

  // ---- ordered, atomic content units --------------------------------
  const units = [];

  units.push({
    key: "lead",
    kind: "block",
    node: (
      <div key="lead">
        <div className="meta-row">
          <div className="meta-left">
            <div className="to-block">
              <div className="muted">To,</div>
              {data.to && <div className="strong">{data.to}</div>}
              {data.company && <div className="strong">{data.company}</div>}
              {data.address && <div>{data.address}</div>}
            </div>
          </div>
          <div className="meta-right">
            {data.quotationNo && (
              <div>
                <span className="muted">Quotation No:</span> {data.quotationNo}
              </div>
            )}
            <div>
              <span className="muted">Date:</span> {formatDate(data.date)}
            </div>
          </div>
        </div>
        {data.subject && (
          <p className="subject">
            <span className="subject-label">Subject:</span> {data.subject}
          </p>
        )}
      </div>
    ),
  });

  if (data.includeAbout) {
    units.push({
      key: "about",
      kind: "block",
      node: (
        <section className="block" key="about">
          <h3 className="block-title">About Us</h3>
          <p className="para">{data.aboutText || "—"}</p>
        </section>
      ),
    });
  }

  units.push({
    key: "svc-heading",
    kind: "block",
    node: (
      <h3 className="block-title" key="svc-heading">
        Services &amp; Pricing
      </h3>
    ),
  });
  data.services.forEach((s, i) => {
    units.push({
      key: `svc-row-${s.id}`,
      kind: "svc-row",
      node: (
        <tr key={s.id}>
          <td className="c-no">{i + 1}</td>
          <td className="strong">{s.name || "—"}</td>
          <td>{s.description ? <MultiLine text={s.description} /> : "—"}</td>
          <td className="c-amt">{inr(parseAmount(s.price))}</td>
        </tr>
      ),
    });
  });
  units.push({
    key: "svc-total",
    kind: "svc-total",
    node: (
      <tr key="svc-total">
        <td colSpan={3} className="c-amt strong">Total</td>
        <td className="c-amt strong">{inr(total)}</td>
      </tr>
    ),
  });
  if (data.showSavingsNote && data.savingsNote) {
    units.push({
      key: "savings",
      kind: "block",
      node: <p className="savings" key="savings">{data.savingsNote}</p>,
    });
  }

  if (data.includeThirdParty) {
    units.push({
      key: "thirdparty",
      kind: "block",
      node: (
        <section className="block" key="thirdparty">
          <h3 className="block-title">Third-Party Integration</h3>
          <table className="tbl">
            <tbody>
              {data.thirdPartyRows.map((r) => (
                <tr key={r.id}>
                  <td className="strong">{r.name || "—"}</td>
                  <td>{r.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ),
    });
  }

  if (data.includeAddOns) {
    units.push({
      key: "addons",
      kind: "block",
      node: (
        <section className="block" key="addons">
          <h3 className="block-title">Optional Add-On Services</h3>
          <ul className="addons">
            {addOnLines.length > 0 ? addOnLines.map((line, i) => <li key={i}>{line}</li>) : <li>—</li>}
          </ul>
        </section>
      ),
    });
  }

  units.push({
    key: "terms",
    kind: "block",
    node: (
      <section className="block" key="terms">
        <h3 className="block-title">Payment Terms</h3>
        <table className="tbl tbl-terms">
          <tbody>
            {terms.map((t) => (
              <tr key={t.id}>
                <td className="strong c-term">{t.label || "—"}</td>
                <td>{t.value || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    ),
  });

  if (data.includeBank) {
    units.push({
      key: "bank",
      kind: "block",
      node: (
        <section className="block" key="bank">
          <h3 className="block-title">Bank Details</h3>
          <table className="tbl tbl-terms">
            <tbody>
              <tr><td className="strong c-term">Account Name</td><td>{BANK_DETAILS.accountName || "—"}</td></tr>
              <tr><td className="strong c-term">Bank Name</td><td>{BANK_DETAILS.bankName || "—"}</td></tr>
              <tr><td className="strong c-term">Branch</td><td>{BANK_DETAILS.branch || "—"}</td></tr>
              <tr><td className="strong c-term">Account Number</td><td>{BANK_DETAILS.accountNumber || "—"}</td></tr>
              <tr><td className="strong c-term">IFSC Code</td><td>{BANK_DETAILS.ifsc || "—"}</td></tr>
            </tbody>
          </table>
        </section>
      ),
    });
  }

  units.push({
    key: "signature",
    kind: "block",
    node: (
      <div className="sign-row" key="signature">
        <div className="sign-block">
          <div className="muted">From {data.companyLine || company.name},</div>
          {data.showSignature && (
            <img className="sign-seal" src="/company-seal.png" alt="Company seal" width="84" height="84" />
          )}
          {data.signatoryName && <div className="strong">{data.signatoryName}</div>}
          {data.designation && <div className="muted">{data.designation}</div>}
        </div>
      </div>
    ),
  });

  const blockUnitsForMeasure = units.filter((u) => u.kind !== "svc-row" && u.kind !== "svc-total");
  const svcUnitsForMeasure = units.filter((u) => u.kind === "svc-row" || u.kind === "svc-total");
  const fallbackTheadHeight = 31;

  const { blockContainerRef, blockRefs, svcTheadRef, svcRowRefs, pageGroups } = usePaginatedBody(
    units,
    BODY_BUDGET,
    fallbackTheadHeight
  );

  // Rendered via a portal straight to <body> — NOT inside the ref'd/exported
  // tree below — so html2canvas (PDF export) and the Word-export clone never
  // see this hidden, same-width copy that exists only to measure real
  // flowed heights before deciding where pages split.
  const measurePortal = createPortal(
    <div className="doc-measure" aria-hidden="true">
      <div className="doc-body" ref={blockContainerRef} style={{ width: BODY_CONTENT_W }}>
        {blockUnitsForMeasure.map((u) => (
          <div key={u.key} ref={(el) => (blockRefs.current[u.key] = el)}>
            {u.node}
          </div>
        ))}
      </div>
      <table className="tbl" style={{ width: BODY_CONTENT_W }}>
        <thead ref={svcTheadRef}>{SVC_THEAD_CONTENT}</thead>
        <tbody>
          {svcUnitsForMeasure
            .filter((u) => u.kind === "svc-row")
            .map((u) => (
              <tr key={u.key} ref={(el) => (svcRowRefs.current[u.key] = el)}>
                {u.node.props.children}
              </tr>
            ))}
        </tbody>
        <tfoot>
          {svcUnitsForMeasure
            .filter((u) => u.kind === "svc-total")
            .map((u) => (
              <tr key={u.key} ref={(el) => (svcRowRefs.current[u.key] = el)}>
                {u.node.props.children}
              </tr>
            ))}
        </tfoot>
      </table>
    </div>,
    document.body
  );

  return (
    <>
      {measurePortal}
      <div className="doc-pages" ref={ref}>
        {pageGroups.map((group, pageIndex) => (
          <div className={`doc-page${pageIndex > 0 ? " doc-page-break" : ""}`} key={pageIndex}>
            <div className="lh-header">
              <img src={company.header} alt={company.name} width="100%" />
            </div>
            <div className="doc-body">
              <img className="lh-watermark" src={company.watermark} alt="" />
              {renderPageBody(group)}
            </div>
            <div className="lh-footer">
              <img src={company.footer} alt={`${company.name} contact details`} width="100%" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
});

export default QuotationPreview;
