// DutyLaunch service catalogue — career services, CV/resume, LinkedIn,
// training & courses.  Prices and descriptions are left empty for the user
// to fill in; only the bundle entry per category gets an "Includes:" list.

function includes(lines) {
  return "Includes:\n" + lines.map((l) => `• ${l}`).join("\n");
}

const CV_ITEMS = [
  "Professional CV Writing",
  "ATS-Friendly CV Creation",
  "Existing CV Improvement",
  "Resume Formatting & Optimization",
  "Achievement-Based Resume Writing",
  "Professional Summary Writing",
  "Executive Resume Writing",
  "Entry-Level Resume Writing",
  "Resume Keyword Optimization",
  "Industry-Specific Resume Customization",
  "Resume Review & Improvement",
  "Resume Revisions",
];

const COVER_ITEMS = [
  "Professional Cover Letter Writing",
  "Customized Cover Letter Creation",
  "Job-Specific Cover Letter Writing",
  "Role-Based Cover Letter Customization",
];

const LINKEDIN_ITEMS = [
  "LinkedIn Profile Optimization",
  "LinkedIn Headline Optimization",
  "LinkedIn Summary & About Section Writing",
  "LinkedIn Experience Section Optimization",
  "LinkedIn Keyword Optimization",
  "Professional Profile Positioning",
];

const CAREER_ITEMS = [
  "Career Profile Assessment",
  "Professional Career Consultation",
  "Career Positioning",
  "Job Application Profile Optimization",
  "Career Guidance",
];

const TRAINING_ITEMS = [
  "Digital Marketing Essentials",
  "Search Engine Marketing",
  "Search Engine Optimization (SEO)",
  "Social Media Marketing",
  "Content Marketing",
  "Paid Advertising",
  "Marketing Analytics",
  "Campaign Planning & Strategy",
  "Audience Targeting & Positioning",
  "Marketing Performance Measurement",
];

function categoryEntries(category, items) {
  return [
    { category, name: `${category} – Complete Package`, description: includes(items), price: "" },
    ...items.map((name) => ({ category, name, description: "", price: "" })),
  ];
}

export const SERVICE_CATALOGUE = [
  ...categoryEntries("CV & Resume Services", CV_ITEMS),
  ...categoryEntries("Cover Letter Services", COVER_ITEMS),
  ...categoryEntries("LinkedIn Profile Services", LINKEDIN_ITEMS),
  ...categoryEntries("Career Development Services", CAREER_ITEMS),
  ...categoryEntries("Training & Courses", TRAINING_ITEMS),
];

export const SERVICES_BY_CATEGORY = SERVICE_CATALOGUE.reduce((acc, s) => {
  (acc[s.category] = acc[s.category] || []).push(s.name);
  return acc;
}, {});

export const CATEGORY_ORDER = [
  "CV & Resume Services",
  "Cover Letter Services",
  "LinkedIn Profile Services",
  "Career Development Services",
  "Training & Courses",
];
