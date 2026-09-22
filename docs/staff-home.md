# Staff Home

Opens at `/staff-home.html`. Entry: `src/pages/staff-home.tsx`.

Built from a static mock rather than a Figma frame, rebuilt on the repo's own
shell, tokens and shadcn primitives. `src/pages/staff-home.tsx` is the page both
this and [Transfer Insights](transfer-insights.md) stand on; the entry point
names the person.

The other side of the desk. Every other prototype here is a student's record
read by somebody; this is the page they land on before they get there — what is
waiting on them this morning, and what Stellic noticed overnight.

## The line the page is built on

Under the greeting it is two panels, and the whole design is the distinction
between them:

- **Open Items** — work somebody sent you. It is routed, it is waiting, and it
  wants a decision.
- **Insights** — work nobody sent you. Stellic found it in the audits you are
  allowed to change, and it wants a fix.

Both are built out of the same furniture — `staff-chrome.tsx` for the sections,
panels, tab bars and menus, `staff-rows.tsx` for the row grammar — so the page
is learned once. The insight tabs are deliberately the same topics in the same
order as the queue tabs, with no "All", so the two read as one page rather than
as two features that shipped together.

## Permissions, jobs, tabs

Three layers, in `src/data/staff-home.ts`, and the design depends on them
staying apart:

| | |
| --- | --- |
| **permissions** | what the institution granted this person |
| **jobs** | what they have chosen to keep on their Home |
| **tabs** | what that puts on the page |

A job is not a tab. `jobAllowed()` is deliberately wider than `tabAllowed()` for
two of them — Audits and Transfer — because their insights are worth having to
somebody who cannot act on the queue. An editor who may change an audit but not
publish one gets the Audits job, and the findings about the programs she owns,
while the Audits tab never appears: there is no publish request she could
approve. Neither prototype currently stands on that case, but the rule is what
keeps the two ideas from collapsing into one.

A job is described in Customize Home by what it brings, in the words of the
person turning it on: "Brings a Notes tab and the Quick Actions button for
logging a new one." Turning it on brings all of it at once — the tab, its
insights, and any companion block elsewhere on the page. That is why Today's
Appointments rides with the Appointments job and Quick Actions rides with Notes
rather than standing on their own.

Customize is not onboarding, and nothing opens it on arrival. A new staff member
does not yet know what these words mean; what they arrive with is an admin
setting, and teaching them the page is its own piece of work.

## Who is looking

Marcus, a registrar: he may publish an audit, edit one, decide an exception, and
graduation clearance steps route to him.

| | |
| --- | --- |
| Permissions | `auditPublish`, `auditEdit`, `makeException`, the `grad` and `exc` workflows |
| Tabs | Audits, Exceptions, Graduation Clearance, Plan Reviews |
| Insight tabs | Exceptions, Audits, Transfers |

He is named once, in `src/main-staff-home.tsx`, and passed to `StaffHome` as
`who`. Nothing switches: the account circle is the plain grey disc every other
prototype carries.

Jessica, a transfer officer, is the other person defined in
`src/data/staff-home.ts`, and she is what [Transfer Insights](transfer-insights.md)
stands on. Same page, same file, different `who` — which is the argument the
permission model is making: one URL, and what is on it is decided by who opened
it.

Where a person lands is a fact about them rather than a default the queue holds,
so a persona can carry `landsOn`. Jessica's tabs are Appointments and Transfer,
in that priority order, but Transfer is what she opened Home for — so that is
where she starts. Marcus takes the first tab he is allowed, which is Audits.

## Open Items

Tab order is priority order — a person's own record-keeping first, then the
requests waiting on a decision from them — which is not the alphabetical order
Customize Home uses. Search and sort sit on the **section heading** rather than
inside the panel, so the panel can start with its tab bar and the eye finds
search in the same place on every section. The only thing left inside the panel
is the sub-view control on Notes and Appointments.

A workflow tab with nothing waiting tucks into a **More** dropdown showing "0
open", captioned "Quiet right now. These come back as tabs when new requests
need you." The bar renders even at a single tab, so a person whose work later
grows a second one is not surprised by a bar appearing out of nowhere.

Rows behave differently on purpose:

- **Audits** carries publish requests only; a draft nobody submitted is not
  waiting on anyone. The row does not open — a publish is a yes or no about a
  whole version, and the change list behind it was unreadable past four or five
  entries, so the decision is here and the reading is in the editor. A large
  audit publishes in the background: the row stays, saying "Publishing in the
  background, safe to keep working", then clears itself.
- **Exceptions** splits on whether there is a workflow behind the request. A
  direct one is decided here in one press. One with a workflow opens onto the
  rail instead and offers Open.
- **Workflows** open onto the rail. Marcus has two categories, Graduation
  Clearance and Plan Reviews. Transfer is the third, and it is Jessica's —
  credit reviews only, since an articulation is not waiting on anybody and so
  belongs in Insights.

### Plan Reviews

Figma: [`1406:63125`](https://www.figma.com/design/8BFP4evDj7E5coGDemDrnF/New-Planner---Plan-Review?node-id=1406-63125).

The other end of the planner's **Request review**. A student presses it, names
the terms and the plan they want looked at, and the request lands here — which
is why the first node on the rail is called **Request to Review** rather than
"Request submitted": the student's own screen calls it that, and one request
should not have two names depending on which side of the desk you read it from.
The request types are the planner's own `REVIEW_TYPES`, so the row is headed
with the same words the student chose from — plus one the student never sees:
**Freshman Plan Review [2026 Freshmen]** is scoped to a different student set,
which is why it is not in the list Scott is offered and is in the list a
reviewer reads. Its row is Ryo Nakamura, whose record already says Freshman and
carries Business undeclared, which is most of why a first-year plan gets read at
all.

The three students are the roster's own, rather than the names on the mock-up.
Every photograph in this suite belongs to somebody already, and two names
wearing one face is worse than a name that does not match a design file. Where a
student has no photograph at all, `Face` draws one — the same `StudentAvatar`
the roster has used since it had eight rows — and initials stay for the staff,
who are named rather than pictured.

Three nodes, and the middle one is the work: the reviewer marks their decisions
on the plan itself, and **Complete** is what sends it back and releases the
terms from pending. So the primary action reads Complete rather than Start —
the review is not a step to begin, it is one to finish.

Two links the others do not have, because they are what a reviewer reaches for
before deciding: the reference plan the request names, and how much of it has
moved since the request went out. A request nothing has changed under says so
rather than offering a list of nothing.

### The step rail

`StepRail` in `staff-rows.tsx`. Done, current, to-do and skipped nodes on a
connecting line, each carrying its own fields. It is the honest answer to
"where is this?", which a status word never is: it says who approved, who waived
their step, who it is sitting with now and how long it has been there.

The actions hang off the step that is waiting on **you**, not off the row,
because a workflow that enforces no order between two steps is waiting on both
and only one of them is yours. `openSteps()` names every open step and
`yourStep()` picks the one the buttons belong to; no row in the data currently
has two open at once, so the case is supported rather than shown.

## Insights

Data is one entry per program carrying its findings. Each finding has a
severity, a source, the requirement it is about, and — always — a **suggested
fix**, because a finding without one is a complaint. Opportunities also carry
who they reach.

A program is named the way somebody says it out loud — "Mechanical Engineering,
B.Eng." — and not `[BENG-ME]`. The code is how Stellic finds the audit, not how
a person recognises it, so it is nowhere on the page.

Findings bundle under their program rather than arriving as a flat list: a
program with ten problems is one decision, not ten. The row shape follows the
count. One finding renders flat with the message inline; several render as a
count first — "10 critical issues · 2 warnings" — and unfold to the list. There
is no expansion affordance where there is nothing to expand.

The two severities are different **shapes** as well as different colours — an
octagon stops you, a triangle warns you — so the list still sorts itself for a
reader who cannot tell the red from the amber. All three glyphs are outlined:
a filled one among two hollow ones reads as a third state rather than as the
top of a scale.

Sort is Urgency by default, which reads down the severities in turn and then by
how many students stand behind the program. The tier filter (All / Needs fixing
/ Opportunities) marks its button with a dot, because a funnel looks the same
either way.

There is a third kind of insight that belongs to no program — an incoming course
articulated by hand often enough to deserve a rule. It has its own tab and its
own row, and it is on both prototypes: the registrar does not work the transfer
queue, so no Transfer tab appears in Open Items, but a rule written once clears
a pile nobody then has to touch, which is the registrar's business as much as
the transfer office's. That is the line the permission model draws — a queue is
work sent to you, an insight is work nobody sent.

### Hiding

Dismissal is **per-user**: a dismissal is a reading decision rather than a
resolution, so every toast says "Other staff still see it." Nothing is destroyed
— hidden findings go to a drawer at the foot of the same panel, as the same
rows.

There is no Restore in the drawer. An insight leaves the list by being fixed,
not by being put back.

Every hide bumps the "cleared this week" tally in the greeting, which is the
page's own loop and the only reward a queue can offer. Every hide is also
undoable from its toast.

## Elsewhere

Everything that would leave Home is a toast ending "(Exists in the real app)".
The prototype's boundary is Home itself: opening an audit in the editor, opening
a student, starting a workflow step and creating an articulation rule are all
real screens in the product and none of them are here.

## What the shell gained

Three small things, shared rather than forked:

- `Sidebar` grew a Home row with a Beta chip on the staff nav, and `nav()` now
  takes which row to stand on rather than hard-coding Students.
- `AppShell` takes `navCurrent` and an `account` slot.
- Six icons: `report`, `lightbulb`, `swap-vert`, `tune`, `inbox`, `person`.

## Not carried over

The mock logged a PostHog event on every interaction. The event names are part
of the scoping work, not part of the page, and a tracker with nothing behind it
is dead code — so it is left out rather than stubbed.
