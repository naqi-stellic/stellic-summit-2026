/* Who is looking, and what that lets them see.
 *
 * Staff Home is one page that has to be several pages, because a registrar and a
 * transfer officer open it to do entirely different work. Two prototypes stand
 * on this file, each pinned to one of them, and what they have in common is the
 * model rather than the screen: three layers, kept apart.
 *
 *   permissions  what the institution granted this person
 *   jobs         what they have chosen to keep on their Home
 *   tabs         what that puts on the page
 *
 * A job is not a tab. Audits and Transfer are jobs wider than their tabs,
 * because their insights are worth having to somebody who cannot act on the
 * queue — an editor who may change an audit but not publish one still wants to
 * know what is wrong with it. */

/* ============================================================ Tabs */

export type TabKey = "notes" | "appts" | "audits" | "exceptions" | "grad" | "transfer"

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
]

export const TAB_LABELS: Record<TabKey, string> = {
  notes: "Notes",
  appts: "Appointments",
  audits: "Audits",
  exceptions: "Exceptions",
  grad: "Graduation Clearance",
  transfer: "Transfer",
}

export type PersonaKey = "mark" | "jessica"

/** A workflow category whose steps can route to a person. */
export type WorkflowKey = "grad" | "transfer" | "exc"

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
  /** Their own face, as the student they are looking at has one. Initials stay
   *  as the fallback for an image that does not arrive. */
  photo: string
  /** Not rendered anywhere. It is here because a permission set on its own does
   *  not say what job somebody does, and the next reader will want to know. */
  role: string
  /** The tab this person opens on, where the first one in priority order is
   *  not the reason they came. Falls back to the first tab they are allowed. */
  landsOn?: TabKey
  perms: Perms
}

export const PERSONAS: Persona[] = [
  {
    key: "mark",
    name: "Mark",
    initials: "MS",
    /* The same face the student's own record shows in Student Success Network.
       One person, one photograph, wherever the prototypes put him. */
    photo: "/faces/mstehlik.jpg",
    role: "Registrar",
    perms: {
      auditPublish: true,
      auditEdit: true,
      makeException: true,
      /* He does not work the transfer queue — that is Jessica's desk, and his
         workflows say so — but the articulations Stellic has noticed are the
         registrar's business too: a rule written once clears a pile nobody
         has to touch again. Insights is work nobody sent you, and this is
         some of it. */
      articulations: true,
      wf: ["grad", "exc"],
    },
  },
  {
    key: "jessica",
    name: "Jessica",
    initials: "J",
    photo: "/faces/staff-jessica.jpg",
    role: "Transfer office",
    /* Transfer is the work she is here for, so it is where she lands — ahead
       of the appointments that would otherwise take the first slot. */
    landsOn: "transfer",
    perms: {
      auditPublish: false,
      auditEdit: false,
      makeException: false,
      articulations: true,
      wf: ["transfer"],
      appts: true,
    },
  },
]

export const personaOf = (key: PersonaKey) => PERSONAS.find((p) => p.key === key)!

/** Who is signed in on the staff surfaces that do not name somebody themselves
 *  — Proactive Compliance, Students. The registrar, which makes the walk from
 *  Staff Home to a student's record one person's morning rather than three. */
export const SIGNED_IN = personaOf("mark")

/* ============================================================ Jobs */

export type JobKey =
  | "reports"
  | "notes"
  | "appts"
  | "audits"
  | "exc"
  | "grad"
  | "transfer"

export type Job = {
  key: JobKey
  name: string
  /** What turning it on brings, in the words of the person turning it on. */
  detail: string
  /** The same, for somebody who gets the insights and not the queue. A line
   *  promising credit reviews to a registrar who does not work that desk is a
   *  promise the page cannot keep. */
  withoutQueue?: string
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
    withoutQueue:
      "Incoming courses articulated by hand often enough to deserve a rule, so one rule clears the pile.",
    tab: "transfer",
    insights: true,
  },
]

export const JOB_OF_TAB: Record<TabKey, JobKey> = {
  notes: "notes",
  appts: "appts",
  audits: "audits",
  exceptions: "exc",
  grad: "grad",
  transfer: "transfer",
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

/** What Customize Home has to offer. `without` is a prototype saying it does
 *  not carry a job at all — not that this person cannot have it — so the job
 *  is not listed either, because a switch for something the page will not draw
 *  is a promise it cannot keep. */
export const jobsFor = (perms: Perms, without: JobKey[] = []) =>
  JOBS.filter((job) => jobAllowed(job, perms) && !without.includes(job.key)).map((job) =>
    /* A job whose queue this person does not work describes what they will
       actually get. */
    job.withoutQueue && job.tab && !tabAllowed(job.tab, perms)
      ? { ...job, detail: job.withoutQueue }
      : job
  )

/** Every allowed job starts on. What a role should arrive with is an admin
 *  setting in the real product; here it is simply everything they may have. */
export function defaultJobs(perms: Perms, without: JobKey[] = []): Record<string, boolean> {
  const on: Record<string, boolean> = {}
  jobsFor(perms, without).forEach((job) => (on[job.key] = true))
  return on
}
