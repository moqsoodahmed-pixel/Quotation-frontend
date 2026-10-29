// ---------------------------------------------------------------------------
// Company profiles. The app can generate quotations under any of these three
// entities — each has its own letterhead, bank details, seal and numbering
// prefix.  Swap the image files in public/ to update artwork; edit the
// details below when bank/signatory info changes.
// ---------------------------------------------------------------------------

export const COMPANIES = {
  launcherdesk: {
    id: "launcherdesk",
    name: "LauncherDesk",
    prefix: "LD",
    tagline: "Startups Made Easy",
    companyLine: "LauncherDesk",
    logo: "/logo.png",
    header: "/letterhead-header-launcherdesk.png",
    footer: "/letterhead-footer-launcherdesk.png",
    watermark: "/letterhead-watermark-launcherdesk.png",
    seal: "/company-seal.png",
    filePrefix: "LauncherDesk",
    // TODO: Fill in the real "About Us" blurb for LauncherDesk.
    aboutDefault: "",
    bankDetails: {
      accountName: "LAUNCHERDESK",
      // TODO: Fill in LauncherDesk bank name.
      bankName: "",
      // TODO: Fill in LauncherDesk branch.
      branch: "",
      // TODO: Fill in LauncherDesk account number.
      accountNumber: "",
      // TODO: Fill in LauncherDesk IFSC code.
      ifsc: "",
    },
    defaultSignatory: {
      // TODO: Fill in LauncherDesk default signatory name.
      name: "",
      // TODO: Fill in LauncherDesk default signatory designation.
      designation: "",
    },
  },
  dutylaunch: {
    id: "dutylaunch",
    name: "DutyLaunch",
    prefix: "DL",
    tagline: "",
    companyLine: "DutyLaunch",
    logo: "/logo.png", // TODO: Add a DutyLaunch logo at public/logo-dutylaunch.png and update this path.
    header: "/letterhead-header-dutylaunch.png",
    footer: "/letterhead-footer-dutylaunch.png",
    watermark: "/letterhead-watermark-dutylaunch.png",
    seal: "/company-seal.png", // TODO: Add a DutyLaunch seal at public/seal-dutylaunch.png and update this path.
    filePrefix: "DutyLaunch",
    // TODO: Fill in the real "About Us" blurb for DutyLaunch.
    aboutDefault: "",
    bankDetails: {
      // TODO: Fill in DutyLaunch account name.
      accountName: "DUTYLAUNCH",
      // TODO: Fill in DutyLaunch bank name.
      bankName: "",
      // TODO: Fill in DutyLaunch branch.
      branch: "",
      // TODO: Fill in DutyLaunch account number.
      accountNumber: "",
      // TODO: Fill in DutyLaunch IFSC code.
      ifsc: "",
    },
    defaultSignatory: {
      // TODO: Fill in DutyLaunch default signatory name.
      name: "",
      // TODO: Fill in DutyLaunch default signatory designation.
      designation: "",
    },
  },
  officerestore: {
    id: "officerestore",
    name: "Office Restore",
    prefix: "OR",
    tagline: "",
    companyLine: "Office Restore",
    logo: "/logo.png", // TODO: Add an Office Restore logo at public/logo-officerestore.png and update this path.
    header: "/letterhead-header-officerestore.png",
    footer: "/letterhead-footer-officerestore.png",
    watermark: "/letterhead-watermark-officerestore.png",
    seal: "/company-seal.png", // TODO: Add an Office Restore seal at public/seal-officerestore.png and update this path.
    filePrefix: "OfficeRestore",
    // TODO: Fill in the real "About Us" blurb for Office Restore.
    aboutDefault: "",
    bankDetails: {
      // TODO: Fill in Office Restore account name.
      accountName: "OFFICE RESTORE",
      // TODO: Fill in Office Restore bank name.
      bankName: "",
      // TODO: Fill in Office Restore branch.
      branch: "",
      // TODO: Fill in Office Restore account number.
      accountNumber: "",
      // TODO: Fill in Office Restore IFSC code.
      ifsc: "",
    },
    defaultSignatory: {
      // TODO: Fill in Office Restore default signatory name.
      name: "",
      // TODO: Fill in Office Restore default signatory designation.
      designation: "",
    },
  },
};

export const DEFAULT_COMPANY_ID = "launcherdesk";
