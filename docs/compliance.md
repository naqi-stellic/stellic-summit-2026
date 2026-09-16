# Proactive Compliance

Team Progress' second prototype. Opens at `/compliance.html`. Page in
`src/pages/compliance.tsx`, ruleset in `src/data/compliance.ts`, tree in
`src/components/stellic/compliance-tree.tsx`.

Built from a static HTML mock rather than a Figma frame. The mock had the
shape and the vocabulary; everything here is the Advanced What-If prototype's
components, because it is the same page with one more tab on it.

## What this screen is

The same student record read against an eligibility ruleset instead of against
their degree. It is the audit turned sideways: a degree audit asks "what does
the degree still want", this asks "was enough done, in time, every year" — so
the tree is cut by year and by term rather than by requirement.

It is a **staff** screen, which is the first thing the page says. The sidebar
is the institution's list of everything — Students, Programs, Courses,
Pathways, Appointments, Transfer, Requests, Reviews, Staff, Analytics — rather
than one student's path through a degree, and `AppShell` gained a third
`section` for it. The profile carries one action a student's would not: **Mark
Changes as Reviewed**.

## Why it earns a screen

The degree audit next door looks healthy. Ten courses taken, five under way,
nothing overdue. Read the same transcript against the ruleset's clock and the
student is **six credits short** of what the third year asks for — and there is
nothing on Progress that would ever say so.

That gap is computed, not written down. `SHORTFALL` is 40% of `DEGREE.credits`
less what the student actually holds, and the line under the tree reads it
back. Change the plan data and the number moves.

The reason the two screens disagree is worth knowing: the four dual-enrolment
courses are the degree audit's *unmatched* list — they fulfil no requirement —
but they are still credit toward the degree, so a check that counts credits
counts them. Hence `4 counting towards Open Electives` sitting inside Progress
to Degree, which is the mock's own "2 counting towards Free Elective".

## A check is not a requirement

The tree is the audit's tree — same trail, same course rows, same folding, all
imported from `audit-tree.tsx` — because a reader who has learned one should
not have to learn another. Only the middle row differs, and it differs because
a check is a different kind of thing:

| | Requirement | Check |
| --- | --- | --- |
| What it counts | courses | **constraints** |
| The number it carries | credits still wanted | **credits banked** |
| How it ends | fills up | passes, or does not |
| Its mark | state | a **flag** plus state |

The flag says "this is a checkpoint" and the glyph beside it says how it
stands: a check when met, a clock while pending, a count when outstanding.
Pending is `warning-50` rather than alert — there is still time to fix it,
which is the whole premise of a proactive screen.

Each check also says its rule in a line — "6 credits minimum in the term". The
mock leaves that to a tooltip; said out loud it is the only thing on the row
anyone can act on.

## The ruleset

NCAA progress-toward-degree in shape — so many credits a year, so much of the
degree before each year, a minimum each term — and illustrative rather than
authoritative. What matters is that the rules are time-boxed, countable, and
can be failed while the degree audit looks fine.

Every course in it comes from `STUDENT_RECORD`, so a grade or a term can never
drift between this screen and Progress.

Only the year under way opens unfolded. Five years of checks opened whole would
be several hundred rows of things that have not happened yet.

## What is drawn and not wired

The five other tabs switch and say there is no design behind them. Official /
Planned toggles and both read the same ruleset. The profile's three actions are
inert. There is no scope select or recompute button — `AuditControls` now takes
`scopes` as optional, because a ruleset is read whole or not at all.
