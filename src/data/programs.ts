import {
  COUNTING_NOW,
  STUDENT_RECORD,
  type AuditCourse,
  type AuditEntry,
  type AuditGroup,
  type AuditMark,
} from "@/data/audit"
import { CREDITS_PER_COURSE } from "@/data/plan"

/* What else this transcript could be worth.
 *
 * A program here is written the way a catalogue writes one — requirements, and
 * the courses each asks for — and nothing about the student is written into it
 * at all. `auditProgram` runs it against `STUDENT_RECORD` to produce the same
 * `AuditGroup` the degree audit is made of, which is what lets the result be
 * put straight onto the page beside the degree.
 *
 * That is also what makes the answer honest: a course is marked taken here
 * because the student took it, not because someone typed "taken" beside it,
 * and the credits-to-go on a result card is the same count the tree shows. */

export type ProgramKind = "Major" | "Minor" | "Certificate"

export type ProgramRequirement = {
  id: string
  name: string
  tags: string[]
  /** What the requirement asks for. A code the student does not hold is a
   *  course they still owe; a seat is one they will choose later. */
  courses: { code: string; name: string }[]
}

export type Program = {
  id: string
  name: string
  kind: ProgramKind
  school: string
  department: string
  campus: string
  level: "Undergraduate" | "Graduate"
  requirements: ProgramRequirement[]
}

const seat = (name: string) => ({ code: "", name })

/* The catalogue: twenty-five programmes, sized the way the registrar sizes them
 * — a certificate is five courses, a minor is six, and a bachelor's is forty,
 * the same forty the student's own degree asks for. Getting that wrong is the
 * quickest way to make a what-if lie: a major asking for 84 credits would look
 * like a bargain beside the one the student is already on.
 *
 * Nothing here is tuned to produce a pleasing list. The bars are read off the
 * transcript by `programStanding`, and the list ranks itself by what the
 * transcript already answers, so the descent from full to empty is a fact about
 * this student rather than a gradient somebody drew. What is chosen is the
 * catalogue: business programmes near the top because a second-year Business
 * Administration student has already done most of a business core, and Studio
 * Art near the bottom because he has not.
 *
 * The blocks below are shared the way a real institution shares them. Every
 * major carries the general education its college asks for, and only the
 * business ones carry the business core — if all ten shared the core they would
 * all start from the same green floor and nothing would read as a change. */

const seats = (count: number, label: string) => Array.from({ length: count }, () => seat(label))

/** General education, as the College of Business asks for it. */
const GEN_ED = [
  { code: "ENGL 101", name: "Composition I" },
  { code: "ENGL 210", name: "Advanced Composition" },
  { code: "COMM 230", name: "Public Speaking" },
  { code: "HIST 110", name: "World Civilizations" },
  { code: "HIST 205", name: "Modern World History" },
  { code: "PSYC 101", name: "Introduction to Psychology" },
  { code: "ART 105", name: "Visual Culture" },
  { code: "PHIL 240", name: "Business Ethics" },
  { code: "MATH 140", name: "Business Calculus" },
  { code: "BIOL 105", name: "Principles of Biology" },
  { code: "GEOG 120", name: "World Regional Geography" },
  seat("General education elective"),
]

/** The quantitative variant: a degree that runs on statistics asks for the
 *  algebra sequence where the others ask for a laboratory science. */
const GEN_ED_QUANT = GEN_ED.map((course) =>
  "code" in course && course.code === "BIOL 105"
    ? { code: "MATH 110", name: "College Algebra" }
    : course
)

/** The variant a degree with the world in its name asks for: a language and
 *  the other half of the history sequence. */
const GEN_ED_GLOBAL = GEN_ED.map((course) => {
  if (!("code" in course)) return course
  if (course.code === "HIST 205") return { code: "HIST 101", name: "United States History I" }
  if (course.code === "GEOG 120") return { code: "SPAN 101", name: "Elementary Spanish I" }
  return course
})

/** The core every business degree at this college is built on. Ten of its
 *  twelve are already on this student's record or under way, which is the
 *  whole reason a business major reads as nearly free to him. */
const BUSINESS_CORE = [
  { code: "BUS 101", name: "Introduction to Business" },
  { code: "ACCT 201", name: "Financial Accounting" },
  { code: "ACCT 202", name: "Managerial Accounting" },
  { code: "ECON 201", name: "Principles of Microeconomics" },
  { code: "ECON 202", name: "Principles of Macroeconomics" },
  { code: "MIS 120", name: "Business Technology Essentials" },
  { code: "STAT 210", name: "Business Statistics" },
  { code: "MKTG 201", name: "Principles of Marketing" },
  { code: "MGMT 210", name: "Principles of Management" },
  { code: "BLAW 301", name: "Business Law & Ethics" },
  { code: "OPS 320", name: "Operations & Supply Chain Management" },
  { code: "BUS 390", name: "Business Communication" },
]

/** What Arts & Sciences asks for instead: a language and a second history
 *  where the business college wanted a second accounting. Two of them are on
 *  this student's unmatched list, which is the argument for reading it. */
const ARTS_FOUNDATIONS = [
  { code: "ENGL 101", name: "Composition I" },
  { code: "ENGL 210", name: "Advanced Composition" },
  { code: "COMM 230", name: "Public Speaking" },
  { code: "HIST 110", name: "World Civilizations" },
  { code: "HIST 101", name: "United States History I" },
  { code: "SPAN 101", name: "Elementary Spanish I" },
  { code: "SPAN 102", name: "Elementary Spanish II" },
  { code: "PSYC 101", name: "Introduction to Psychology" },
  { code: "ART 105", name: "Visual Culture" },
  { code: "PHIL 240", name: "Business Ethics" },
  { code: "BIOL 105", name: "Principles of Biology" },
  { code: "GEOG 120", name: "World Regional Geography" },
]

/** Fine Arts asks for the least of the three, and shares the least with a
 *  business transcript. */
const ARTS_STUDIO_FOUNDATIONS = [
  { code: "ENGL 101", name: "Composition I" },
  { code: "ENGL 210", name: "Advanced Composition" },
  { code: "HIST 110", name: "World Civilizations" },
  { code: "ARTH 210", name: "History of Western Art I" },
  { code: "ARTH 250", name: "History of Western Art II" },
  { code: "PHIL 210", name: "Aesthetics" },
  { code: "BIOL 105", name: "Principles of Biology" },
  seat("Fine arts general education elective"),
]

type MajorSpec = {
  id: string
  name: string
  school: string
  department: string
  campus?: string
  /** The general education block this college asks for. */
  foundation: { id: string; name: string; courses: { code: string; name: string }[] }
  /** The business core, for the colleges that run on one. */
  shared?: { id: string; name: string; courses: { code: string; name: string }[] }
  core: { name: string; courses: { code: string; name: string }[] }
  /** What the major calls its own electives. */
  electiveLabel: string
  electives: number
}

/** A bachelor's, assembled from its blocks. Forty courses every time: the
 *  foundation, the core it shares with its college, its own core, its own
 *  electives, and open electives for whatever is left. */
function major(spec: MajorSpec): Program {
  const named =
    spec.foundation.courses.length +
    (spec.shared?.courses.length ?? 0) +
    spec.core.courses.length +
    spec.electives
  const open = 40 - named

  return {
    id: spec.id,
    name: spec.name,
    kind: "Major",
    school: spec.school,
    department: spec.department,
    campus: spec.campus ?? "Main campus",
    level: "Undergraduate",
    requirements: [
      {
        id: `${spec.id}-foundation`,
        name: spec.foundation.name,
        tags: ["fulfill all"],
        courses: spec.foundation.courses,
      },
      ...(spec.shared
        ? [
            {
              id: `${spec.id}-shared`,
              name: spec.shared.name,
              tags: ["fulfill all"],
              courses: spec.shared.courses,
            },
          ]
        : []),
      {
        id: `${spec.id}-core`,
        name: spec.core.name,
        tags: ["fulfill all"],
        courses: spec.core.courses,
      },
      {
        id: `${spec.id}-electives`,
        name: `${spec.electiveLabel} Electives`,
        tags: [`at least ${spec.electives * CREDITS_PER_COURSE} credits`],
        courses: seats(spec.electives, `${spec.electiveLabel} elective`),
      },
      ...(open > 0
        ? [
            {
              id: `${spec.id}-open`,
              name: "Open Electives",
              tags: [`at least ${open * CREDITS_PER_COURSE} credits`],
              courses: seats(open, "Open elective"),
            },
          ]
        : []),
    ],
  }
}

/** A minor: four named courses and two of its own choosing. Six every time,
 *  which is what makes the list comparable down its whole length. */
function minor(spec: {
  id: string
  name: string
  school: string
  department: string
  core: { code: string; name: string }[]
}): Program {
  return {
    id: spec.id,
    name: spec.name,
    kind: "Minor",
    school: spec.school,
    department: spec.department,
    campus: "Main campus",
    level: "Undergraduate",
    requirements: [
      {
        id: `${spec.id}-core`,
        name: `${spec.name} Core`,
        tags: ["fulfill all"],
        courses: spec.core,
      },
      {
        id: `${spec.id}-electives`,
        name: `${spec.name} Electives`,
        tags: [`at least ${(6 - spec.core.length) * CREDITS_PER_COURSE} credits`],
        courses: seats(6 - spec.core.length, `${spec.name} elective`),
      },
    ],
  }
}

const BUSINESS = { school: "College of Business", campus: "Main campus" }
const SCIENCES = { school: "College of Arts & Sciences", campus: "Main campus" }

const MAJORS: Program[] = [
  major({
    id: "accounting-bs",
    name: "Accounting, B.S.",
    school: BUSINESS.school,
    department: "Accounting",
    foundation: { id: "gen-ed", name: "General Education", courses: GEN_ED },
    shared: { id: "core", name: "Business Core", courses: BUSINESS_CORE },
    core: {
      name: "Accounting Core",
      courses: [
        { code: "FIN 301", name: "Corporate Finance" },
        { code: "ACCT 310", name: "Intermediate Accounting I" },
        { code: "ACCT 320", name: "Intermediate Accounting II" },
        { code: "ACCT 330", name: "Cost Accounting" },
        { code: "ACCT 410", name: "Auditing" },
        { code: "ACCT 420", name: "Federal Taxation" },
        { code: "ACCT 450", name: "Accounting Information Systems" },
        { code: "ACCT 460", name: "Advanced Financial Accounting" },
        { code: "ACCT 495", name: "Accounting Capstone" },
      ],
    },
    electiveLabel: "Accounting",
    electives: 3,
  }),
  major({
    id: "business-analytics-bs",
    name: "Business Analytics, B.S.",
    school: BUSINESS.school,
    department: "Management",
    foundation: { id: "gen-ed", name: "General Education", courses: GEN_ED_QUANT },
    shared: { id: "core", name: "Business Core", courses: BUSINESS_CORE },
    core: {
      name: "Analytics Core",
      courses: [
        { code: "DATA 220", name: "Foundations of Data Analytics" },
        { code: "DATA 310", name: "Data Visualization" },
        { code: "DATA 330", name: "Business Intelligence" },
        { code: "STAT 320", name: "Econometrics for Business" },
        { code: "STAT 340", name: "Predictive Modeling" },
        { code: "MIS 250", name: "Management Information Systems" },
        { code: "MIS 410", name: "Data Management & Governance" },
        { code: "DATA 495", name: "Analytics Capstone" },
      ],
    },
    electiveLabel: "Analytics",
    electives: 3,
  }),
  major({
    id: "marketing-bs",
    name: "Marketing, B.S.",
    school: BUSINESS.school,
    department: "Marketing",
    foundation: { id: "gen-ed", name: "General Education", courses: GEN_ED },
    shared: { id: "core", name: "Business Core", courses: BUSINESS_CORE },
    core: {
      name: "Marketing Core",
      courses: [
        { code: "MKTG 310", name: "Consumer Behavior" },
        { code: "MKTG 320", name: "Marketing Research" },
        { code: "MKTG 330", name: "Digital Marketing" },
        { code: "MKTG 410", name: "Brand Management" },
        { code: "MKTG 420", name: "Integrated Marketing Communications" },
        { code: "MKTG 440", name: "Sales Management" },
        { code: "MKTG 495", name: "Marketing Strategy Capstone" },
      ],
    },
    electiveLabel: "Marketing",
    electives: 4,
  }),
  major({
    id: "management-bs",
    name: "Management, B.S.",
    school: BUSINESS.school,
    department: "Management",
    foundation: { id: "gen-ed", name: "General Education", courses: GEN_ED },
    shared: { id: "core", name: "Business Core", courses: BUSINESS_CORE },
    core: {
      name: "Management Core",
      courses: [
        { code: "MGMT 310", name: "Organizational Behavior" },
        { code: "MGMT 320", name: "Human Resource Management" },
        { code: "MGMT 340", name: "Leading Teams" },
        { code: "MGMT 410", name: "Negotiation & Conflict" },
        { code: "MGMT 430", name: "Change Management" },
        { code: "MGMT 495", name: "Management Capstone" },
      ],
    },
    electiveLabel: "Management",
    electives: 5,
  }),
  major({
    id: "supply-chain-bs",
    name: "Supply Chain Management, B.S.",
    school: BUSINESS.school,
    department: "Management",
    foundation: { id: "gen-ed", name: "General Education", courses: GEN_ED_QUANT },
    shared: { id: "core", name: "Business Core", courses: BUSINESS_CORE },
    core: {
      name: "Supply Chain Core",
      courses: [
        { code: "OPS 330", name: "Procurement & Sourcing" },
        { code: "OPS 340", name: "Logistics & Distribution" },
        { code: "OPS 410", name: "Supply Chain Analytics" },
        { code: "OPS 420", name: "Quality Management" },
        { code: "OPS 440", name: "Global Supply Chains" },
        { code: "OPS 495", name: "Supply Chain Capstone" },
      ],
    },
    electiveLabel: "Supply Chain",
    electives: 5,
  }),
  major({
    id: "international-business-bs",
    name: "International Business, B.S.",
    school: BUSINESS.school,
    department: "Management",
    foundation: { id: "gen-ed", name: "General Education", courses: GEN_ED_GLOBAL },
    shared: { id: "core", name: "Business Core", courses: BUSINESS_CORE },
    core: {
      name: "International Business Core",
      courses: [
        { code: "FIN 301", name: "Corporate Finance" },
        { code: "IBUS 310", name: "Global Business Environment" },
        { code: "IBUS 330", name: "Cross-Cultural Management" },
        { code: "IBUS 410", name: "International Trade & Policy" },
        { code: "IBUS 440", name: "Global Strategy" },
        { code: "SPAN 201", name: "Intermediate Spanish I" },
        { code: "SPAN 202", name: "Intermediate Spanish II" },
        { code: "IBUS 495", name: "International Business Capstone" },
      ],
    },
    electiveLabel: "International Business",
    electives: 4,
  }),
  major({
    id: "economics-ba",
    name: "Economics, B.A.",
    school: SCIENCES.school,
    department: "Economics",
    foundation: {
      id: "foundations",
      name: "Arts & Sciences Foundations",
      courses: ARTS_FOUNDATIONS,
    },
    core: {
      name: "Economics Core",
      courses: [
        { code: "ECON 201", name: "Principles of Microeconomics" },
        { code: "ECON 202", name: "Principles of Macroeconomics" },
        { code: "ECON 310", name: "Money & Banking" },
        { code: "ECON 320", name: "Intermediate Microeconomics" },
        { code: "ECON 330", name: "Intermediate Macroeconomics" },
        { code: "ECON 340", name: "Public Finance" },
        { code: "ECON 410", name: "International Economics" },
        { code: "ECON 400", name: "Economic Research Seminar" },
        { code: "MATH 110", name: "College Algebra" },
        { code: "MATH 140", name: "Business Calculus" },
        { code: "STAT 210", name: "Business Statistics" },
        { code: "STAT 320", name: "Econometrics for Business" },
      ],
    },
    electiveLabel: "Economics",
    electives: 5,
  }),
  major({
    id: "psychology-ba",
    name: "Psychology, B.A.",
    school: SCIENCES.school,
    department: "Psychology",
    foundation: {
      id: "foundations",
      name: "Arts & Sciences Foundations",
      courses: ARTS_FOUNDATIONS,
    },
    core: {
      name: "Psychology Core",
      courses: [
        { code: "PSYC 210", name: "Developmental Psychology" },
        { code: "PSYC 230", name: "Social Psychology" },
        { code: "PSYC 250", name: "Research Methods in Psychology" },
        { code: "PSYC 310", name: "Cognitive Psychology" },
        { code: "PSYC 330", name: "Abnormal Psychology" },
        { code: "PSYC 350", name: "Biological Psychology" },
        { code: "PSYC 410", name: "Psychological Assessment" },
        { code: "PSYC 495", name: "Senior Thesis in Psychology" },
      ],
    },
    electiveLabel: "Psychology",
    electives: 6,
  }),
  major({
    id: "communication-ba",
    name: "Communication Studies, B.A.",
    school: SCIENCES.school,
    department: "Communication",
    foundation: {
      id: "foundations",
      name: "Arts & Sciences Foundations",
      courses: ARTS_FOUNDATIONS,
    },
    core: {
      name: "Communication Core",
      courses: [
        { code: "COMM 240", name: "Interpersonal Communication" },
        { code: "COMM 260", name: "Media & Society" },
        { code: "COMM 310", name: "Rhetorical Theory" },
        { code: "COMM 330", name: "Organizational Communication" },
        { code: "COMM 350", name: "Persuasion" },
        { code: "COMM 410", name: "Communication Research Methods" },
        { code: "COMM 495", name: "Communication Capstone" },
      ],
    },
    electiveLabel: "Communication",
    electives: 6,
  }),
  major({
    id: "studio-art-bfa",
    name: "Studio Art, B.F.A.",
    school: "College of Fine Arts",
    department: "Art & Design",
    campus: "Downtown campus",
    foundation: {
      id: "foundations",
      name: "Fine Arts Foundations",
      courses: ARTS_STUDIO_FOUNDATIONS,
    },
    core: {
      name: "Studio Core",
      courses: [
        { code: "ART 110", name: "Drawing I" },
        { code: "ART 120", name: "Two-Dimensional Design" },
        { code: "ART 130", name: "Three-Dimensional Design" },
        { code: "ART 210", name: "Painting I" },
        { code: "ART 220", name: "Printmaking I" },
        { code: "ART 240", name: "Sculpture I" },
        { code: "ART 310", name: "Figure Drawing" },
        { code: "ART 330", name: "Digital Media" },
        { code: "ART 410", name: "Advanced Studio I" },
        { code: "ART 420", name: "Advanced Studio II" },
        { code: "ART 480", name: "Professional Practices" },
        { code: "ART 495", name: "B.F.A. Thesis Exhibition" },
      ],
    },
    electiveLabel: "Studio",
    electives: 8,
  }),
]

const MINORS: Program[] = [
  minor({
    id: "data-analytics-minor",
    name: "Data Analytics",
    school: "School of Computing",
    department: "Data Analytics",
    core: [
      { code: "MATH 110", name: "College Algebra" },
      { code: "MATH 140", name: "Business Calculus" },
      { code: "MIS 120", name: "Business Technology Essentials" },
      { code: "STAT 210", name: "Business Statistics" },
      { code: "DATA 220", name: "Foundations of Data Analytics" },
    ],
  }),
  minor({
    id: "economics-minor",
    name: "Economics",
    school: SCIENCES.school,
    department: "Economics",
    core: [
      { code: "ECON 201", name: "Principles of Microeconomics" },
      { code: "ECON 202", name: "Principles of Macroeconomics" },
      { code: "MATH 140", name: "Business Calculus" },
      { code: "ECON 310", name: "Money & Banking" },
    ],
  }),
  minor({
    id: "accounting-minor",
    name: "Accounting",
    school: BUSINESS.school,
    department: "Accounting",
    core: [
      { code: "ACCT 201", name: "Financial Accounting" },
      { code: "ACCT 202", name: "Managerial Accounting" },
      { code: "ACCT 310", name: "Intermediate Accounting I" },
      { code: "ACCT 330", name: "Cost Accounting" },
    ],
  }),
  minor({
    id: "statistics-minor",
    name: "Statistics",
    school: SCIENCES.school,
    department: "Mathematics",
    core: [
      { code: "MATH 140", name: "Business Calculus" },
      { code: "STAT 210", name: "Business Statistics" },
      { code: "STAT 320", name: "Econometrics for Business" },
      { code: "STAT 340", name: "Predictive Modeling" },
    ],
  }),
  minor({
    id: "marketing-minor",
    name: "Marketing",
    school: BUSINESS.school,
    department: "Marketing",
    core: [
      { code: "MKTG 201", name: "Principles of Marketing" },
      { code: "MKTG 310", name: "Consumer Behavior" },
      { code: "MKTG 320", name: "Marketing Research" },
      { code: "MKTG 330", name: "Digital Marketing" },
    ],
  }),
  minor({
    id: "information-systems-minor",
    name: "Information Systems",
    school: "School of Computing",
    department: "Information Systems",
    core: [
      { code: "MIS 120", name: "Business Technology Essentials" },
      { code: "MIS 250", name: "Management Information Systems" },
      { code: "MIS 310", name: "Systems Analysis & Design" },
      { code: "MIS 410", name: "Data Management & Governance" },
    ],
  }),
  minor({
    id: "history-minor",
    name: "History",
    school: SCIENCES.school,
    department: "History",
    core: [
      { code: "HIST 101", name: "United States History I" },
      { code: "HIST 110", name: "World Civilizations" },
      { code: "HIST 205", name: "Modern World History" },
      { code: "HIST 310", name: "Historiography" },
    ],
  }),
  minor({
    id: "management-minor",
    name: "Management",
    school: BUSINESS.school,
    department: "Management",
    core: [
      { code: "MGMT 210", name: "Principles of Management" },
      { code: "MGMT 310", name: "Organizational Behavior" },
      { code: "MGMT 320", name: "Human Resource Management" },
      { code: "BLAW 301", name: "Business Law & Ethics" },
    ],
  }),
  minor({
    id: "entrepreneurship-minor",
    name: "Entrepreneurship",
    school: BUSINESS.school,
    department: "Management",
    core: [
      { code: "BUS 101", name: "Introduction to Business" },
      { code: "ENTR 200", name: "Foundations of Entrepreneurship" },
      { code: "ENTR 310", name: "New Venture Creation" },
      { code: "ENTR 400", name: "Venture Finance" },
    ],
  }),
  minor({
    id: "communication-minor",
    name: "Communication",
    school: SCIENCES.school,
    department: "Communication",
    core: [
      { code: "COMM 230", name: "Public Speaking" },
      { code: "COMM 240", name: "Interpersonal Communication" },
      { code: "COMM 310", name: "Rhetorical Theory" },
      { code: "COMM 350", name: "Persuasion" },
    ],
  }),
  minor({
    id: "psychology-minor",
    name: "Psychology",
    school: SCIENCES.school,
    department: "Psychology",
    core: [
      { code: "PSYC 101", name: "Introduction to Psychology" },
      { code: "PSYC 210", name: "Developmental Psychology" },
      { code: "PSYC 230", name: "Social Psychology" },
      { code: "PSYC 310", name: "Cognitive Psychology" },
    ],
  }),
  minor({
    id: "spanish-minor",
    name: "Spanish",
    school: SCIENCES.school,
    department: "Modern Languages",
    core: [
      { code: "SPAN 101", name: "Elementary Spanish I" },
      { code: "SPAN 102", name: "Elementary Spanish II" },
      { code: "SPAN 201", name: "Intermediate Spanish I" },
      { code: "SPAN 202", name: "Intermediate Spanish II" },
    ],
  }),
  minor({
    id: "art-history-minor",
    name: "Art History",
    school: "College of Fine Arts",
    department: "Art & Design",
    core: [
      { code: "ART 105", name: "Visual Culture" },
      { code: "ARTH 210", name: "History of Western Art I" },
      { code: "ARTH 250", name: "History of Western Art II" },
      { code: "ARTH 320", name: "Modern & Contemporary Art" },
    ],
  }),
  minor({
    id: "philosophy-minor",
    name: "Philosophy",
    school: SCIENCES.school,
    department: "Philosophy",
    core: [
      { code: "PHIL 210", name: "Aesthetics" },
      { code: "PHIL 220", name: "Logic" },
      { code: "PHIL 310", name: "Ethical Theory" },
      { code: "PHIL 330", name: "Philosophy of Mind" },
    ],
  }),
  minor({
    id: "music-minor",
    name: "Music",
    school: "College of Fine Arts",
    department: "Music",
    core: [
      { code: "MUSC 110", name: "Music Theory I" },
      { code: "MUSC 120", name: "Aural Skills I" },
      { code: "MUSC 210", name: "Music History I" },
      { code: "MUSC 310", name: "Applied Studio" },
    ],
  }),
]

const CERTIFICATES: Program[] = [
  {
    id: "business-analytics-certificate",
    name: "Business Analytics",
    kind: "Certificate",
    school: BUSINESS.school,
    department: "Management",
    campus: "Downtown campus",
    level: "Undergraduate",
    requirements: [
      {
        id: "cert-core",
        name: "Certificate Core",
        tags: ["fulfill all"],
        courses: [
          { code: "MIS 120", name: "Business Technology Essentials" },
          { code: "STAT 210", name: "Business Statistics" },
          { code: "DATA 220", name: "Foundations of Data Analytics" },
          { code: "DATA 330", name: "Business Intelligence" },
        ],
      },
      {
        id: "cert-elective",
        name: "Certificate Elective",
        tags: ["at least 3 credits"],
        courses: [seat("Analytics elective")],
      },
    ],
  },
  {
    id: "project-management-certificate",
    name: "Project Management",
    kind: "Certificate",
    school: BUSINESS.school,
    department: "Management",
    campus: "Main campus",
    level: "Undergraduate",
    requirements: [
      {
        id: "pm-core",
        name: "Certificate Core",
        tags: ["fulfill all"],
        courses: [
          { code: "MGMT 210", name: "Principles of Management" },
          { code: "MGMT 340", name: "Leading Teams" },
          { code: "OPS 320", name: "Operations & Supply Chain Management" },
          { code: "PM 310", name: "Project Planning & Control" },
        ],
      },
      {
        id: "pm-elective",
        name: "Certificate Elective",
        tags: ["at least 3 credits"],
        courses: [seat("Project management elective")],
      },
    ],
  },
]

export const PROGRAMS: Program[] = [...MAJORS, ...MINORS, ...CERTIFICATES]

/* -------------------------------------------------------------- the audit */

let seq = 0

/** One requirement's course, read against the transcript: what the student
 *  holds if they hold it, and what they owe if they do not. */
function auditCourse(
  want: { code: string; name: string },
  alongside: boolean
): AuditCourse {
  const held = want.code ? STUDENT_RECORD.get(want.code) : undefined

  if (!held) {
    return {
      kind: "course",
      id: `p${++seq}`,
      code: want.code,
      name: want.name,
      credits: CREDITS_PER_COURSE,
      mark: "remaining",
    }
  }

  return {
    kind: "course",
    id: `p${++seq}`,
    code: held.code,
    name: want.name,
    credits: held.credits,
    mark: held.mark,
    result: held.result,
    grade: held.grade,
    /* Only a course already counting toward the degree can count twice. One
       off the unmatched list was counting toward nothing, so taking it up
       here is not double counting — it is the first time it has counted. */
    doubleCounts: alongside && COUNTING_NOW.has(held.code),
  }
}

/** The program as an audit: the same tree the degree is drawn from, so it can
 *  be put on the page beside it without anything new being taught.
 *
 *  `alongside` says whether the degree is still on the record. Adding a
 *  program leaves it there, and courses that answer both are marked; changing
 *  major takes it away, and nothing is counting twice because there is only
 *  one program left to count toward. */
export function auditProgram(program: Program, alongside: boolean): AuditGroup {
  const children: AuditEntry[] = program.requirements.map((requirement) => {
    const courses = requirement.courses.map((want) => auditCourse(want, alongside))

    return {
      kind: "group",
      id: `${program.id}-${requirement.id}`,
      level: "requirement",
      name: requirement.name,
      mark: groupMark(courses),
      tags: requirement.tags,
      /* A group of nothing but seats has nothing to read — every row of it
         says the same thing — so it opens folded, as the degree's own
         elective groups do. */
      collapsed: requirement.courses.every((want) => !want.code),
      children: courses,
    }
  })

  const standing = programStanding(program)

  return {
    kind: "group",
    id: program.id,
    level: "degree",
    name: `${program.name} [${program.kind.toLowerCase()}]`,
    subtitle: `${program.school} · ${program.department} · Catalog Term: Fall 2025`,
    tags: [`fulfill all | at least ${programTotal(program) * CREDITS_PER_COURSE} credits`],
    counts: { requirements: standing.remaining, milestones: 0 },
    bar: {
      taken: standing.taken,
      inProgress: standing.inProgress,
      claimed: standing.planned,
      total: programTotal(program),
    },
    children,
  }
}

/** How a requirement stands, from how its courses do: done when every course
 *  is, under way when any has started, outstanding otherwise. */
function groupMark(courses: AuditCourse[]): AuditMark {
  if (courses.every((course) => course.mark === "taken")) return "taken"
  if (courses.some((course) => course.mark !== "remaining")) return "in-progress"
  return "remaining"
}

/* ------------------------------------------------------------- the figures */

/** Where the student would stand against this program — counted off the same
 *  requirements the tree is built from, so the card and the tree cannot
 *  disagree. */
export function programStanding(program: Program) {
  const marks = program.requirements.flatMap((requirement) =>
    requirement.courses.map(
      (want) => (want.code ? STUDENT_RECORD.get(want.code)?.mark : undefined) ?? "remaining"
    )
  )
  const count = (...of: AuditMark[]) => marks.filter((mark) => of.includes(mark)).length

  return {
    taken: count("taken"),
    inProgress: count("in-progress"),
    planned: count("registered", "planned"),
    remaining: count("remaining"),
  }
}

export function programTotal(program: Program): number {
  return program.requirements.reduce((sum, r) => sum + r.courses.length, 0)
}

/** What is left to earn. */
export function creditsToGo(program: Program): number {
  return programStanding(program).remaining * CREDITS_PER_COURSE
}

/** What the transcript already answers — which is what the results are ranked
 *  by. It is the better question of the two: "how much of this have I done"
 *  ranks a 120-credit major above a minor that is nearly free, and that is the
 *  right way round when the question was what else this record is worth. */
export function reusedCredits(program: Program): number {
  const { taken, inProgress, planned } = programStanding(program)
  return (taken + inProgress + planned) * CREDITS_PER_COURSE
}

/** How much of the program is already answered, as a share of it. This is what
 *  the list is ranked by, because it is what the bars show: ranked by credits
 *  instead, a forty-course major with a third done sits above a six-course
 *  minor with two thirds done, and the column of bars goes up and down the
 *  page instead of running out. Credits break the ties, so the larger of two
 *  equally-answered programs is the one offered first. */
export function reusedShare(program: Program): number {
  const { taken, inProgress, planned } = programStanding(program)
  return (taken + inProgress + planned) / Math.max(programTotal(program), 1)
}

/* ------------------------------------------------------------------ filters */

export type FilterField = {
  id: keyof Pick<Program, "school" | "department" | "campus" | "kind" | "level">
  label: string
  placeholder: string
}

export type FilterGroup = {
  id: string
  label: string
  fields: FilterField[]
}

export const FILTER_GROUPS: FilterGroup[] = [
  {
    id: "offered-by",
    label: "Offered By",
    fields: [
      { id: "school", label: "School", placeholder: "Select School" },
      { id: "department", label: "Department", placeholder: "Select Department" },
      { id: "campus", label: "Campus", placeholder: "Select Campus" },
    ],
  },
  {
    id: "type",
    label: "Type",
    fields: [{ id: "kind", label: "Type", placeholder: "Select Type" }],
  },
  {
    id: "level",
    label: "Level",
    fields: [{ id: "level", label: "Level", placeholder: "Select Level" }],
  },
]

/** What a field can be filtered to, read off the programs on offer rather than
 *  written down beside them — a filter that offers something nothing is would
 *  return nothing. */
export function fieldOptions(field: FilterField["id"], within: Program[] = PROGRAMS): string[] {
  return [...new Set(within.map((program) => program[field]))].sort()
}

export type FilterState = Partial<Record<FilterField["id"], string[]>>

/** Every field with a value has to be satisfied; a field with none asks
 *  nothing. Ranked by how much of the record each program already answers. */
export function matchPrograms(filters: FilterState, within: Program[] = PROGRAMS): Program[] {
  return within
    .filter((program) =>
      Object.entries(filters).every(([field, values]) => {
        if (!values || values.length === 0) return true
        return values.includes(program[field as FilterField["id"]])
      })
    )
    .sort((a, b) => reusedCredits(b) - reusedCredits(a))
}

export function activeFilters(filters: FilterState): { field: FilterField; values: string[] }[] {
  return FILTER_GROUPS.flatMap((group) =>
    group.fields
      .filter((field) => (filters[field.id]?.length ?? 0) > 0)
      .map((field) => ({ field, values: filters[field.id] ?? [] }))
  )
}

export function groupOf(field: FilterField): FilterGroup {
  return FILTER_GROUPS.find((group) => group.fields.includes(field))!
}

/** The codes this program would actually count — the ones the student holds.
 *  A course it asks for and they have not got counts toward nothing yet. */
export function countedBy(program: Program): Set<string> {
  return new Set(
    program.requirements
      .flatMap((requirement) => requirement.courses.map((want) => want.code))
      .filter((code) => code && STUDENT_RECORD.has(code))
  )
}

/** Mark the degree's own copies of the courses a second program has taken up.
 *  Double counting is a fact about a course, not about one tree, so it has to
 *  show on both — except under an additional check, which consumes nothing and
 *  would put the mark on half the audit. */
export function markDoubleCounting(audit: AuditGroup, codes: Set<string>): AuditGroup {
  const mark = (entry: AuditEntry): AuditEntry => {
    if (entry.kind === "course") {
      return codes.has(entry.code) ? { ...entry, doubleCounts: true } : entry
    }
    /* A milestone is nobody's course and cannot count twice. */
    if (entry.kind === "milestone") return entry
    if (entry.restated) return entry
    return { ...entry, children: entry.children.map(mark) }
  }

  return { ...audit, children: audit.children.map(mark) }
}
