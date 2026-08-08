// ---------------------------------------------------------------------------
// LauncherDesk company constants.
// The letterhead header/footer bands are fixed images (client/public/
// letterhead-*.png) with the real contact/legal details baked in — these
// constants only flow into the app topbar and the signature block.
// ---------------------------------------------------------------------------

export const COMPANY = {
  name: "LauncherDesk",
  tagline: "Startups Made Easy",
  // Contact defaults pre-filled into the "Contact & Signature" section.
  companyLine: "LauncherDesk",
};

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
