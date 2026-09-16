/* Who is looking, and what that lets them see.
 *
 * Staff Home is one page that has to be several pages, because a registrar, an
 * advisor and a transfer officer open it to do entirely different work. The
 * model has three layers and the whole design depends on them staying apart:
 *
 *   permissions  what the institution granted this person
 *   jobs         what they have chosen to keep on their Home
 *   tabs         what that puts on the page
 *
 * The case that justifies the separation is a curriculum admin who may edit an
 * audit but not publish one. She gets the Audits *job* — the insights about the
 * programs she owns are hers to act on — while the Audits *tab* never appears,
 * because there is no publish request she could approve. A job is not a tab. */

export type PersonaKey =
  | "naqi"
  | "priya"
  | "marcus"
  | "jessica"
  | "records"
  | "abroad"
  | "faculty"

/** A workflow category whose steps can route to a person. */
export type WorkflowKey = "grad" | "transfer" | "other" | "exc"

export type Perms = {
  /** May approve a publish request, which is what puts the Audits tab on Home. */
  auditPublish: boolean
  /** May change an audit. Enough to be shown what is wrong with one. */
  auditEdit: boolean
  /** May decide an exception without a workflow behind it. */
  makeException: boolean
  /** May write transfer articulation rules. */
  articulations: boolean
  /** Which workflow categories route steps to this person. */
  wf: WorkflowKey[]
  notes?: boolean
  appts?: boolean
}

export type Persona = {
  key: PersonaKey
  name: string
  initials: string
  /** Avatar ground. Not a token — these are people, not states. */
  color: string
  role: string
  perms: Perms
}

export const PERSONAS: Persona[] = [
  {
    key: "naqi",
    name: "Naqi",
    initials: "NQ",
    color: "#6941c6",
    role: "Registrar",
    perms: {
      auditPublish: true,
      auditEdit: true,
      makeException: true,
      articulations: true,
      wf: ["grad", "transfer", "other", "exc"],
    },
  },
  {
    key: "priya",
    name: "Priya",
    initials: "PR",
    color: "#0b7a6b",
    role: "Curriculum admin",
    /* Edits audits, cannot publish them. The reason the job and the tab are
       two different things. */
    perms: {
      auditPublish: false,
      auditEdit: true,
      makeException: false,
      articulations: false,
      wf: [],
    },
  },
  {
    key: "marcus",
    name: "Marcus",
    initials: "ML",
    color: "#175cd3",
    role: "Advisor",
    perms: {
      auditPublish: false,
      auditEdit: false,
      makeException: true,
      articulations: false,
      wf: ["grad", "exc"],
      notes: true,
      appts: true,
    },
  },
  {
    key: "jessica",
    name: "Jessica",
    initials: "J",
    color: "#0e7090",
    role: "Transfer office",
    perms: {
      auditPublish: false,
      auditEdit: false,
      makeException: false,
      articulations: true,
      wf: ["transfer"],
    },
  },
  {
    key: "records",
    name: "Renata Souza",
    initials: "RS",
    color: "#b54708",
    role: "Graduation Certification",
    perms: {
      auditPublish: false,
      auditEdit: false,
      makeException: false,
      articulations: false,
      wf: ["grad"],
    },
  },
  {
    key: "abroad",
    name: "Yusuf Demir",
    initials: "YD",
    color: "#9f1ab1",
    role: "Study Abroad Coordinator",
    perms: {
      auditPublish: false,
      auditEdit: false,
      makeException: false,
      articulations: false,
      wf: ["other"],
    },
  },
  {
    key: "faculty",
    name: "Grace Okonkwo",
    initials: "GO",
    color: "#3e4784",
    role: "Faculty Advisor",
    perms: {
      auditPublish: false,
      auditEdit: false,
      makeException: false,
      articulations: false,
      wf: [],
      notes: true,
    },
  },
]

export const personaOf = (key: PersonaKey) => PERSONAS.find((p) => p.key === key)!

/* ============================================================ Tabs */

export type TabKey = "notes" | "appts" | "audits" | "exceptions" | "grad" | "transfer" | "other"

/** Display order, which is priority order rather than the alphabetical order
 *  Customize Home uses: a person's own record-keeping first, then the requests
 *  waiting on a decision from them. */
export const ALL_TABS: TabKey[] = [
  "notes",
  "appts",
  "audits",
  "exceptions",
  "grad",
  "transfer",
  "other",
]

export const TAB_LABELS: Record<TabKey, string> = {
  notes: "Notes",
  appts: "Appointments",
  audits: "Audits",
  exceptions: "Exceptions",
  grad: "Graduation Clearance",
  transfer: "Transfer",
  other: "Other Requests",
}

/* ============================================================ Jobs */

export type JobKey =
  | "reports"
  | "notes"
  | "appts"
  | "audits"
  | "exc"
  | "grad"
  | "transfer"
  | "other"

export type Job = {
  key: JobKey
  name: string
  /** What turning it on brings, in the words of the person turning it on. */
  detail: string
  /** The Open Items tab it owns, where it owns one. */
  tab: TabKey | null
  /** Whether it brings insights as well as a queue. */
  insights: boolean
}

/* Organised by the job to be done, not by the section it lands in. Turning a
 * job on brings everything it owns at once: the tab, its insights, and any
 * companion block elsewhere on the page. Appointments brings both the tab and
 * today's schedule; Notes brings both the tab and Quick Actions. */
export const JOBS: Job[] = [
  {
    key: "reports",
    name: "Reports",
    detail:
      "The reports you pin in Analytics, with their current numbers. Nothing to act on, just the counts you check most often.",
    tab: null,
    insights: false,
  },
  {
    key: "notes",
    name: "Advising notes",
    detail:
      "Concerns, referrals and mentions your team logs on your advisees. Brings a Notes tab and the Quick Actions button for logging a new one.",
    tab: "notes",
    insights: false,
  },
  {
    key: "appts",
    name: "Appointments",
    detail:
      "Your meetings for today, who showed up, and the log of what you discussed. Brings an Appointments tab and today's schedule to the top of Home.",
    tab: "appts",
    insights: false,
  },
  {
    key: "audits",
    name: "Audits",
    detail:
      "Publish requests waiting on your approval, plus the issues and opportunities Stellic finds in the audits you can edit.",
    tab: "audits",
    insights: true,
  },
  {
    key: "exc",
    name: "Exceptions",
    detail:
      "Exception requests waiting on your decision, plus the patterns worth fixing in the audit so the same request stops coming back.",
    tab: "exceptions",
    insights: true,
  },
  {
    key: "grad",
    name: "Graduation Clearance",
    detail:
      "Clearance steps assigned to you, with each student's remaining requirements and where their graduation application sits.",
    tab: "grad",
    insights: false,
  },
  {
    key: "transfer",
    name: "Transfer",
    detail:
      "Credit reviews waiting on your decision, plus incoming courses articulated by hand often enough to deserve a rule.",
    tab: "transfer",
    insights: true,
  },
  {
    key: "other",
    name: "Other requests",
    detail:
      "Study abroad approvals and any other custom workflow that routes a step to you.",
    tab: "other",
    insights: false,
  },
]

export const JOB_OF_TAB: Record<TabKey, JobKey> = {
  notes: "notes",
  appts: "appts",
  audits: "audits",
  exceptions: "exc",
  grad: "grad",
  transfer: "transfer",
  other: "other",
}

/* ============================================================ Gating */

/** Whether this person's permissions put the tab within reach at all. */
export function tabAllowed(tab: TabKey, perms: Perms): boolean {
  if (tab === "notes") return !!perms.notes
  if (tab === "appts") return !!perms.appts
  if (tab === "audits") return perms.auditPublish
  if (tab === "exceptions") return perms.makeException || perms.wf.includes("exc")
  return perms.wf.includes(tab)
}

/** A job nobody can act in never appears in Customize Home — there is nothing
 *  honest to offer. Audits and Transfer are wider than their tabs, because
 *  their insights are worth having without the queue. */
export function jobAllowed(job: Job, perms: Perms): boolean {
  if (job.key === "reports") return true
  if (job.key === "audits") return perms.auditPublish || perms.auditEdit
  if (job.key === "transfer") return perms.wf.includes("transfer") || perms.articulations
  return job.tab ? tabAllowed(job.tab, perms) : false
}

export const jobsFor = (perms: Perms) => JOBS.filter((job) => jobAllowed(job, perms))

/** Every allowed job starts on. What a role should arrive with is an admin
 *  setting in the real product; here it is simply everything they may have. */
export function defaultJobs(perms: Perms): Record<string, boolean> {
  const on: Record<string, boolean> = {}
  jobsFor(perms).forEach((job) => (on[job.key] = true))
  return on
}
