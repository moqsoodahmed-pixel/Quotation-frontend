import html2pdf from "html2pdf.js";

// Build a filename like LauncherDesk_Quotation_SKY-2026-001.pdf
function fileBase(data) {
  const no = (data.quotationNo || "quotation").replace(/[^\w-]+/g, "-");
  return `LauncherDesk_Quotation_${no}`;
}

// PDF: rasterise the live preview node into an A4 PDF. Pages are already
// fixed-size with zero gap between them (.doc-page, see app.css), so the
// total rendered height is an exact multiple of one page — html2pdf's
// pixel-based "legacy" pagination just needs to slice every pxPageHeight,
// no page-break markers required.
export function downloadPdf(previewNode, data) {
  if (!previewNode) return;
  const opt = {
    margin: 0,
    filename: `${fileBase(data)}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["legacy"] },
  };
  const w = html2pdf().set(opt).from(previewNode);
  window.__debugPdfDataUri = () =>
    w.toContainer().then(() => w.toCanvas()).then(() => w.toPdf()).then(() => w.output("datauristring"));
  return w
    .toContainer()
    .then(() => w.toCanvas())
    .then(() => w.toPdf())
    .then(() => w.save());
}

// Fetch an (same-origin) image URL and inline it as a base64 data URI, so it
// still renders once the HTML is saved out and reopened as a standalone file.
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

// Word: wrap the preview HTML so Word opens it as an editable .doc, forced
// to a standard A4 page (Word otherwise falls back to the user's default
// page size, e.g. US Letter), with the letterhead images embedded inline.
export async function downloadWord(previewNode, data) {
  if (!previewNode) return;
  const clone = previewNode.cloneNode(true);
  // The hidden same-width copy used to measure page breaks (see
  // QuotationPreview.jsx) isn't styled in this export's plain <style> block
  // below, so it would otherwise dump duplicate, fully-visible content.
  clone.querySelector(".doc-measure")?.remove();
  // Word's HTML import doesn't honour position:absolute reliably, so the
  // centered watermark on each page (fine on-screen/PDF via CSS) is dropped
  // here rather than risk it landing as a giant, badly-placed inline image.
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

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileBase(data)}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
