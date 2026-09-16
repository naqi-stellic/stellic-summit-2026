# Staff Home

Opens at `/staff-home.html`. Entry: `src/pages/staff-home.tsx`.

Built from a static mock rather than a Figma frame, rebuilt on the repo's own
shell, tokens and shadcn primitives.

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

The case that justifies the separation is Priya, a curriculum admin with
`auditEdit` but not `auditPublish`. She gets the Audits **job** — the findings
about the programs she owns are hers to act on — while the Audits **tab** never
appears, because there is no publish request she could approve. A job is not a
tab, and `jobAllowed()` is wider than `tabAllowed()` for exactly two jobs:
Audits and Transfer, whose insights are worth having without the queue.

A job is described in Customize Home by what it brings, in the words of the
person turning it on: "Brings a Notes tab and the Quick Actions button for
logging a new one." Turning it on brings all of it at once — the tab, its
insights, and any companion block elsewhere on the page. That is why Today's
Appointments rides with the Appointments job and Quick Actions rides with Notes
rather than standing on their own.

Customize is not onboarding, and nothing opens it on arrival. A new staff member
does not yet know what these words mean; what they arrive with is an admin
setting, and teaching them the page is its own piece of work.

## View as

Seven personas, switched from the account circle in the top bar
(`staff-persona.tsx`), captioned "prototype only" because it is not a feature.

| | Role | Has |
| --- | --- | --- |
| Naqi | Registrar | everything |
| Priya | Curriculum admin | `auditEdit`, no `auditPublish` |
| Marcus | Advisor | exceptions, grad clearance, notes, appointments |
| Jessica | Transfer office | articulations, transfer |
| Renata Souza | Graduation Certification | grad clearance only |
| Yusuf Demir | Study Abroad Coordinator | one workflow category |
| Grace Okonkwo | Faculty Advisor | notes only |

It is the only way to read the page for what it is. As one person Staff Home is
a dashboard; as seven it is a permission model, and the seven are the argument.
Marcus has no Insights section at all. Priya has no Open Items section at all.
Grace has a single tab.

Both panels are keyed on the persona, so switching who is looking starts them
afresh: the tab, the search and anything unfolded belonged to the last person.

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
- **Workflows** open onto the rail. **Transfer** holds two kinds of work at
  once — credit reviews that want a decision, and articulations that want
  nobody's approval — so the articulations sit under the requests rather than
  among them.

### The step rail

`StepRail` in `staff-rows.tsx`. Done, current, to-do and skipped nodes on a
connecting line, each carrying its own fields. It is the honest answer to
"where is this?", which a status word never is: it says who approved, who waived
their step, who it is sitting with now and how long it has been there.

The actions hang off the step that is waiting on **you**, not off the row,
because a workflow that enforces no order between two steps is waiting on both
and only one of them is yours. Study Abroad Course Approval is the case: the
registrar's step takes the buttons, and the study abroad office's says "Waiting
since Aug 2, not waiting on you."

## Insights

Data is one entry per program carrying its findings. Each finding has a
severity, a source, the requirement it is about, and — always — a **suggested
fix**, because a finding without one is a complaint. Opportunities also carry
who they reach.

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

### Transfers

Figma: [`16:13521`](https://www.figma.com/design/gcskEkzwNusd12TOommFW0/Staff-Home?node-id=16-13521).

The Transfers tab is the one place on the page where nothing belongs to a
program. A row is an incoming course that staff keep articulating by hand, so it
leads with that course and the institution it comes from, and the body leads
with the size of the pile a rule would clear — "38 pending articulations".

Its second line is the only thing on Home that Stellic is guessing at: it has
matched an incoming course to a home one. So it is the only line that carries
the assistant's mark, and the only one that says **Suggestion** where every
other finding says **Suggested**. Those findings are a fact with a fix; this is
a proposal, and the wording keeps them apart.

Sort is Urgency by default, which reads down the severities in turn and then by
how many students stand behind the program. The tier filter (All / Needs fixing
/ Opportunities) marks its button with a dot, because a funnel looks the same
either way.

### Hiding

Dismissal is **per-user**: `hidden` is held per persona and every toast says
"Other staff still see it." Nothing is destroyed — hidden findings go to a
drawer at the foot of the same panel, as the same rows.

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
- `AppShell` takes `navCurrent` and an `account` slot; Staff Home hangs the
  persona menu on the account circle.
- Six icons: `report`, `lightbulb`, `swap-vert`, `tune`, `inbox`, `person`.

## Not carried over

The mock logged a PostHog event on every interaction. The event names are part
of the scoping work, not part of the page, and a tracker with nothing behind it
is dead code — so it is left out rather than stubbed.
