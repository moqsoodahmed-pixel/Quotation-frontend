// ---------------------------------------------------------------------------
// Company profiles. The app can generate quotations under any of these three
// entities — each has its own letterhead header/footer/watermark images
// (client/public/letterhead-*-<id>.png) with the real contact/legal details
// baked in. Swap those image files to update a company's letterhead art;
// no code changes needed.
// ---------------------------------------------------------------------------

export const COMPANIES = {
  launcherdesk: {
    id: "launcherdesk",
    name: "LauncherDesk",
    tagline: "Startups Made Easy",
    companyLine: "LauncherDesk",
    header: "/letterhead-header-launcherdesk.png",
    footer: "/letterhead-footer-launcherdesk.png",
    watermark: "/letterhead-watermark-launcherdesk.png",
  },
  dutylaunch: {
    id: "dutylaunch",
    name: "DutyLaunch",
    tagline: "",
    companyLine: "DutyLaunch",
    header: "/letterhead-header-dutylaunch.png",
    footer: "/letterhead-footer-dutylaunch.png",
    watermark: "/letterhead-watermark-dutylaunch.png",
  },
  officerestore: {
    id: "officerestore",
    name: "Office Restore",
    tagline: "",
    companyLine: "Office Restore",
    header: "/letterhead-header-officerestore.png",
    footer: "/letterhead-footer-officerestore.png",
    watermark: "/letterhead-watermark-officerestore.png",
  },
};

export const DEFAULT_COMPANY_ID = "launcherdesk";

// Back-compat default — the contact/signature defaults that used to be the
// only company. Prefer COMPANIES[companyId] for anything letterhead-aware.
export const COMPANY = COMPANIES[DEFAULT_COMPANY_ID];

// Fixed bank details — same on every quotation. Only an admin edits these here.
export const BANK_DETAILS = {
  accountName: "LAUNCHERDESK",
  bankName: "",
  branch: "",
  accountNumber: "",
  ifsc: "",
};

// Default signatory shown in the signature block (editable per quotation).
export const DEFAULT_SIGNATORY = {
  name: "",
  designation: "",
};
