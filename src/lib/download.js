import html2pdf from "html2pdf.js";
import { COMPANIES, DEFAULT_COMPANY_ID } from "../data/company.js";

// Build a filename like OfficeRestore_Quotation_OR-2026-001.pdf
function fileBase(data, companyId) {
  const company = COMPANIES[companyId] || COMPANIES[DEFAULT_COMPANY_ID];
  const prefix = company.filePrefix || company.name.replace(/\s+/g, "");
  const no = (data.quotationNo || "quotation").replace(/[/]+/g, "-").replace(/[^\w-]+/g, "");
  return `${prefix}_Quotation_${no}`;
}

export function downloadPdf(previewNode, data, companyId) {
  if (!previewNode) return;
  const opt = {
    margin: 0,
    filename: `${fileBase(data, companyId)}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["legacy"] },
  };
  const w = html2pdf().set(opt).from(previewNode);
  window.__debugPdfDataUri = () =>
    w.toContainer().then(() => w.toCanvas()).then(() => w.toPdf()).then(() => w.output("datauristring"));
  previewNode.classList.add("pdf-export");
  const restoreGap = () => previewNode.classList.remove("pdf-export");
  return w
    .toContainer()
    .then(() => w.toCanvas())
    .then(() => restoreGap())
    .then(() => w.toPdf())
    .then(() => w.save())
    .catch((err) => {
      restoreGap();
      throw err;
    });
}

async function toDataUrl(src) {
  const res = await fetch(src);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function downloadWord(previewNode, data, companyId) {
  if (!previewNode) return;
  const clone = previewNode.cloneNode(true);
  clone.querySelector(".doc-measure")?.remove();
  clone.querySelectorAll(".lh-watermark").forEach((el) => el.remove());
  const imgs = clone.querySelectorAll("img[src^='/']");
  await Promise.all(
    Array.from(imgs).map(async (img) => {
      img.src = await toDataUrl(img.getAttribute("src"));
    })
  );
  const inner = clone.innerHTML;
  const html = `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8">
<style>
  @page Section1 { size: 210mm 297mm; margin: 0mm; mso-page-orientation: portrait; }
  div.Section1 { page: Section1; }
  body{font-family:Calibri,Arial,sans-serif;color:#1a2333;margin:0;}
  table{border-collapse:collapse;width:100%;}
  td,th{border:1px solid #cbd5e1;padding:8px 10px;font-size:12px;}
  th{background:#0f3d6e;color:#fff;text-align:left;}
  h1,h2,h3{color:#0f3d6e;margin:0 0 6px;}
  .doc-page-break{page-break-before:always;mso-page-break-before:always;}
</style></head>
<body><div class="Section1">${inner}</div></body></html>`;

  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileBase(data, companyId)}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
