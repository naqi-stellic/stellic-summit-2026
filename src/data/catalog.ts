/* The requirements still outstanding for the Finance concentration, in the
 * order the generator should try to place them: core business first, then the
 * concentration, then general education — which is what PLANNING_RULES calls
 * "Core before general". Every course is 3 credits, so 40 requirements make up
 * the degree's 120 credits.
 *
 * A requirement with no specific course behind it yet is a placeholder: the
 * generator reserves the seat and the student picks the course later.
 *
 * There are 23 of them, which is exactly what a full-time pace has room for in
 * the terms left before Spring 2030: ten courses are behind the student, seven
 * are already on the plan, and 10 + 7 + 23 is the degree. Change this list and
 * the four-year plan either overruns or ends short.
 *
 * Five of the 23 are electives — two for the concentration and three open —
 * which is what the generator has to hold as seats in the terms nearest the
 * student. Fewer than that and the near terms come out with nothing left to
 * choose. */

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
  /* Planned once, in Spring 2028 — the seat held there now stands in its
     place, so the course itself is outstanding again. */
  { code: "FIN 415", name: "Financial Modeling & Valuation", reason: "Finance concentration" },
  { code: "STAT 320", name: "Econometrics for Business", reason: "Finance concentration" },
  /* One of the two concentration seats; the other is already held in Spring
     2028, so it is not outstanding. */
  {
    code: "FIN ELEC",
    name: "Finance elective",
    reason: "Concentration elective",
    placeholder: true,
  },
  { code: "ENGL 210", name: "Advanced Composition", reason: "General education" },
  { code: "PHIL 240", name: "Business Ethics", reason: "General education" },
  { code: "HIST 205", name: "Modern World History", reason: "General education" },
  { code: "GEN ELEC", name: "General elective", reason: "Open elective", placeholder: true },
  { code: "GEN ELEC", name: "General elective", reason: "Open elective", placeholder: true },
  { code: "GEN ELEC", name: "General elective", reason: "Open elective", placeholder: true },
  { code: "BUS 495", name: "Strategic Management", reason: "Capstone, taken last" },
]

/* Actual courses that can stand in an elective seat. A seat is a requirement
 * with no course chosen against it, so resolving one means picking from what
 * the catalogue offers for that requirement — which is what these are. They
 * are not requirements in their own right and never appear in the list above;
 * they only exist to fill a seat. */
export const ELECTIVE_COURSES: Record<string, CatalogEntry[]> = {
  "FIN ELEC": [
    { code: "FIN 405", name: "Behavioral Finance", reason: "Concentration elective" },
    { code: "FIN 425", name: "Private Equity", reason: "Concentration elective" },
    { code: "FIN 455", name: "Financial Technology", reason: "Concentration elective" },
    { code: "FIN 465", name: "Venture Capital", reason: "Concentration elective" },
    { code: "FIN 475", name: "Commodities & Energy Markets", reason: "Concentration elective" },
    { code: "FIN 485", name: "Credit Risk Analysis", reason: "Concentration elective" },
  ],
  "GEN ELEC": [
    { code: "ANTH 210", name: "Cultural Anthropology", reason: "Open elective" },
    { code: "PHIL 120", name: "Logic & Critical Thinking", reason: "Open elective" },
    { code: "MUSC 120", name: "Music & Society", reason: "Open elective" },
    { code: "GEOG 230", name: "Cities & Urban Life", reason: "Open elective" },
    { code: "ASTR 101", name: "Introduction to Astronomy", reason: "Open elective" },
    { code: "FILM 150", name: "Film & Visual Storytelling", reason: "Open elective" },
  ],
}

/** Everything an elective seat could be filled with, whichever kind it is. */
export const ALL_ELECTIVES: CatalogEntry[] = Object.values(ELECTIVE_COURSES).flat()

/** A held place rather than a course: used when the draft has to drop a course
 *  whose requirement still stands, and when a seat is added by hand. */
export const REPLACEMENT_SEAT: CatalogEntry = {
  code: "FIN ELEC",
  name: "Finance elective",
  reason: "Seat held for a course you pick later",
  placeholder: true,
}
