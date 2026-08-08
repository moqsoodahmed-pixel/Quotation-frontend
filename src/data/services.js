// LauncherDesk service catalogue.
// Each entry: { category, name, description, price }. Picking one from the
// "Insert service" dropdown fills the service row's name, description
// (the package's "Includes" list) and price in one go — all three stay
// editable afterwards, this is just the starting point.

function includes(lines) {
  return "Includes:\n" + lines.map((l) => `• ${l}`).join("\n");
}

const PLC_STARTER_ITEMS = [
  "Name Approval",
  "2 Director Identification Numbers (DIN)",
  "2 Digital Signature Certificates (DSC)",
  "Certificate of Incorporation (COI)",
  "Memorandum of Association (MOA)",
  "Articles of Association (AOA)",
  "PAN Card",
  "TAN",
  "EPF Registration",
  "ESIC Registration",
  "MSME (Udyam) Registration",
  "GST Registration",
  "Shops & Establishments Registration",
];

const PLC_PRO_ITEMS = [
  ...PLC_STARTER_ITEMS,
  "Social Media Account Creation (Facebook, Instagram, LinkedIn & X)",
  "Basic Business Website (Up to 5 Pages)",
  "Company Logo Design",
  "Letterhead Design",
  "Visiting Card Design",
  "Google Business Profile (GMB) Setup",
  "Business Email Configuration",
  "Company Intro Video (30–60 Seconds)",
  "WhatsApp Chat Integration",
  "Contact Form Setup",
  "Basic On-Page SEO",
];

const PLC_PREMIUM_ITEMS = [
  ...PLC_PRO_ITEMS,
  "Auditor Appointment (ADT-1 Filing)",
  "Business Bank Account Opening Assistance",
  "Payment Gateway Setup Assistance",
  "Professional Tax Establishment (PTE) Registration",
  "1 Year Compliance Support Package",
  "Annual ROC Filing",
  "DIR-3 KYC (if applicable)",
  "DPT-3 Filing (if applicable)",
  "Annual General Meeting (AGM) Compliance Guidance",
  "MCA Compliance Reminders",
  "Basic Compliance Consultation",
];

export const SERVICE_CATALOGUE = [
  {
    category: "Private Limited Company",
    name: "Private Limited Company – Starter Package",
    description: includes(PLC_STARTER_ITEMS),
    price: "30000",
  },
  {
    category: "Private Limited Company",
    name: "Private Limited Company – Pro Package",
    description: includes(PLC_PRO_ITEMS),
    price: "40000",
  },
  {
    category: "Private Limited Company",
    name: "Private Limited Company – Premium Package",
    description: includes(PLC_PREMIUM_ITEMS),
    price: "50000",
  },
];

// Grouped map for building an <optgroup> dropdown.
export const SERVICES_BY_CATEGORY = SERVICE_CATALOGUE.reduce((acc, s) => {
  (acc[s.category] = acc[s.category] || []).push(s.name);
  return acc;
}, {});

// Category order as it appears in the dropdown.
export const CATEGORY_ORDER = ["Private Limited Company"];
