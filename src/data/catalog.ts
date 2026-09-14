/* The requirements still outstanding for the Finance concentration, in the
 * order the generator should try to place them: core business first, then the
 * concentration, then general education — which is what PLANNING_RULES calls
 * "Core before general". Every course is 3 credits, so 40 requirements make up
 * the degree's 120 credits.
 *
 * A requirement with no specific course behind it yet is a placeholder: the
 * generator reserves the seat and the student picks the course later. */

export type CatalogEntry = {
  code: string
  name: string
  /** Why the generator reached for it, shown on the added card. */
  reason: string
  /** No course chosen yet — the draft is holding a seat. */
  placeholder?: boolean
}

export const REMAINING_REQUIREMENTS: CatalogEntry[] = [
  { code: "MGMT 210", name: "Principles of Management", reason: "Business core" },
  { code: "MKTG 201", name: "Principles of Marketing", reason: "Business core" },
  { code: "ACCT 310", name: "Intermediate Accounting I", reason: "Business core" },
  { code: "MIS 250", name: "Management Information Systems", reason: "Business core" },
  { code: "BLAW 301", name: "Business Law & Ethics", reason: "Business core" },
  { code: "OPS 320", name: "Operations & Supply Chain Management", reason: "Business core" },
  { code: "BUS 390", name: "Business Communication", reason: "Business core" },
  { code: "ECON 310", name: "Money & Banking", reason: "Finance concentration" },
  { code: "FIN 350", name: "Financial Institutions & Markets", reason: "Finance concentration" },
  { code: "FIN 420", name: "Derivatives & Risk Management", reason: "Finance concentration" },
  { code: "FIN 430", name: "International Finance", reason: "Finance concentration" },
  { code: "FIN 445", name: "Real Estate Finance", reason: "Finance concentration" },
  { code: "FIN 460", name: "Mergers & Acquisitions", reason: "Finance concentration" },
  { code: "FIN 470", name: "Fixed Income Analysis", reason: "Finance concentration" },
  { code: "STAT 320", name: "Econometrics for Business", reason: "Finance concentration" },
  {
    code: "FIN ELEC",
    name: "Finance elective",
    reason: "Concentration elective",
    placeholder: true,
  },
  {
    code: "FIN ELEC",
    name: "Finance elective",
    reason: "Concentration elective",
    placeholder: true,
  },
  { code: "ENGL 210", name: "Advanced Composition", reason: "General education" },
  { code: "PHIL 240", name: "Business Ethics", reason: "General education" },
  { code: "COMM 230", name: "Public Speaking", reason: "General education" },
  { code: "PSYC 101", name: "Introduction to Psychology", reason: "General education" },
  { code: "HIST 205", name: "Modern World History", reason: "General education" },
  { code: "SCI 210", name: "Environmental Science", reason: "General education" },
  { code: "SPAN 201", name: "Intermediate Spanish I", reason: "General education" },
  { code: "GEN ELEC", name: "General elective", reason: "Open elective", placeholder: true },
  { code: "BUS 495", name: "Strategic Management", reason: "Capstone, taken last" },
]

/** Stands in for a requirement whose course the draft had to drop. */
export const REPLACEMENT_SEAT: CatalogEntry = {
  code: "FIN ELEC",
  name: "Finance elective",
  reason: "Replaces a course that is no longer offered",
  placeholder: true,
}
