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
  /* The core the first year leads to: the courses in the plan now are the
     foundations, and these are what they are foundations for. */
  { code: "ECON 201", name: "Principles of Microeconomics", reason: "Business core" },
  { code: "ECON 202", name: "Principles of Macroeconomics", reason: "Business core" },
  { code: "ACCT 202", name: "Managerial Accounting", reason: "Business core" },
  { code: "STAT 210", name: "Business Statistics", reason: "Business core" },
  { code: "MKTG 201", name: "Principles of Marketing", reason: "Business core" },
  { code: "FIN 301", name: "Corporate Finance", reason: "Business core" },
  { code: "MGMT 210", name: "Principles of Management", reason: "Business core" },
  { code: "MGMT 340", name: "Organizational Behavior", reason: "Business core" },
  { code: "ACCT 310", name: "Intermediate Accounting I", reason: "Business core" },
  { code: "MIS 250", name: "Management Information Systems", reason: "Data Analytics minor" },
  { code: "BLAW 301", name: "Business Law & Ethics", reason: "Business core" },
  { code: "OPS 320", name: "Operations & Supply Chain Management", reason: "Business core" },
  { code: "BUS 390", name: "Business Communication", reason: "Business core" },
  { code: "ECON 310", name: "Money & Banking", reason: "Finance concentration" },
  { code: "FIN 340", name: "Investments & Portfolio Management", reason: "Finance concentration" },
  { code: "FIN 420", name: "Derivatives & Risk Management", reason: "Finance concentration" },
  { code: "FIN 430", name: "International Finance", reason: "Finance concentration" },
  { code: "FIN 445", name: "Real Estate Finance", reason: "Finance concentration" },
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
  { code: "FIN 415", name: "Financial Modeling & Valuation", reason: "Finance concentration" },
  { code: "STAT 320", name: "Econometrics for Business", reason: "Data Analytics minor" },
  /* The concentration's own seat, which nothing in the plan holds yet. */
  {
    code: "FIN ELEC",
    name: "Finance elective",
    reason: "Concentration elective",
    placeholder: true,
  },
  { code: "DATA 210", name: "Foundations of Data Analytics", reason: "Data Analytics minor" },
  { code: "SOC 101", name: "Introduction to Sociology", reason: "General education" },
  { code: "BIO 105", name: "Human Biology", reason: "General education" },
  { code: "GEN ELEC", name: "General elective", reason: "Open elective", placeholder: true },
  { code: "PHIL 240", name: "Business Ethics", reason: "General education" },
  { code: "GEN ELEC", name: "General elective", reason: "Open elective", placeholder: true },
  { code: "GEN ELEC", name: "General elective", reason: "Open elective", placeholder: true },
  { code: "GEN ELEC", name: "General elective", reason: "Open elective", placeholder: true },
  /* The minor's own elective, held like any other seat but filled from the
     data shelf rather than the general one. */
  {
    code: "DATA ELEC",
    name: "Data analytics elective",
    reason: "Data Analytics minor",
    placeholder: true,
  },
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
  "DATA ELEC": [
    { code: "DATA 310", name: "Data Visualisation", reason: "Data Analytics minor" },
    { code: "DATA 330", name: "Predictive Modelling", reason: "Data Analytics minor" },
    { code: "DATA 350", name: "Database Systems", reason: "Data Analytics minor" },
    { code: "DATA 370", name: "Machine Learning for Business", reason: "Data Analytics minor" },
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


/* ------------------------------------------------------------- offerings */

export type TermName = "Fall" | "Spring" | "Summer"

/** Which terms a course runs in. The catalogue does not say, so it is seeded
 *  off the code the way sections and prerequisites are: the same course always
 *  reads the same, most run in both semesters, a few in one, and only a
 *  handful over the summer. */
export function offeredIn(code: string): TermName[] {
  const seed = [...code].reduce((n, c) => n + c.charCodeAt(0), 0)
  const level = Number(code.replace(/\D+/g, "")) || 100
  /* The capstone is the exception worth writing down: it is taken last, and
     the school runs it once a year. */
  if (code === "BUS 495") return ["Spring"]

  const both: TermName[] = ["Fall", "Spring"]
  const one: TermName[] = seed % 2 === 0 ? ["Fall"] : ["Spring"]
  /* How often a course comes round follows how deep it is. The foundations
     run every semester because everyone needs them; a fourth-year elective
     runs once a year, which is what makes when it runs worth filtering on. */
  const terms = level >= 400 ? (seed % 4 === 0 ? both : one) : level >= 300 ? (seed % 3 === 0 ? one : both) : both
  /* Summer is a short list: the foundations, and nothing deep. */
  return level < 300 && seed % 3 === 0 ? [...terms, "Summer"] : terms
}
