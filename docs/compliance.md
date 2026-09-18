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
`section` for it. The bar at the top says **Student Progress** where the
student's own copy says Track Progress: whose progress it is is the difference
between the two screens. The profile carries one action a student's would not:
**Mark Changes as Reviewed**.

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

## Two rulesets

**NCAA 2026** and **Federal Financial Aid**, one under the other and both open.
That is the argument for having two: they measure the same transcript against
clocks that know nothing about each other. Aid's three tests — a qualitative one
on GPA, a quantitative one on pace, and a ceiling on how long the whole thing
may take — are all fine. Eligibility is not. A student can be ineligible to play
and perfectly funded, or the other way round, and neither ruleset can see the
other.

Year 2 opens folded, like every year but the one you unfold. Both ruleset heads
fold from their own row, and inside them the whole row is the control — the
name, the mark and the space around them — because a chevron is a small target
for the commonest thing anyone does here. The badges keep their own press.

Both are illustrative rather than authoritative. What matters is that they are
time-boxed, countable, and can fail while the degree audit looks healthy.

## Official and Planned

The toggle works. Everything the plan reaches turns from outstanding to planned
and carries what the plan would put against it — `planned` on a check, read by
`asPlanned()` in `src/data/compliance.ts` and by nothing else, so the Official
view does not know the plan exists.

It is worth doing because the two rulesets answer differently. The plan closes
the NCAA year check — 21 credits against the 18 it wants — and leaves the aid
check open, because six credits in the spring is half a term whatever it does
for eligibility. One plan, two verdicts.

## Explain

The verdict is on the row; the working is behind it, in the audit's own two
moves. The **constraints badge** is the way into the rules — it is already the
name of the thing, so a second control beside it saying "rules" would be naming
it twice — and every check opens onto at least its own rule, with the one the
screen is about carrying the whole set. **Explain** and search arrive on hover,
on the row the pointer is on rather than all of them at once, and always on a
touch screen where there is no pointer to travel. Explain is offered only on the
check that is going wrong. It opens the same sidebar Explain
Progress uses — `ExplainPanel`, which now takes its content either from an audit
group it reads itself or from a caller that hands it over, because a compliance
check is not a requirement and nothing on the page could derive its rules.

**Editing the copy:** the constraints are plain data in `PTD_CONSTRAINTS` in
`src/data/compliance.ts`, under a marked `---- EDITING ----` block. `text` is
the rule, `notes` are the lines under it, `progress` and `limit` draw the
fraction on the right. Change the words there and the panel follows. No markup,
no JSX.

## Progress

Both tabs are live and Progress is the real audit — the same `AUDIT` tree
Advanced What-If renders. The credential heads it and the program hangs off it,
which is two rows because they are two facts: the credential carries what the
whole degree asks for and how far along it is, the program carries which
catalogue it is being read against and what it has earned. `AuditGroup.level`
is `degree | program | requirement` again, as it was before the concentration
row was taken out of the middle of it. Nobody standing on Progress would have any reason to open
Compliance, which is exactly why Compliance has to exist.

**Plans** is not a tab: it is the planner. It opens `/planner.html?from=compliance`,
and the planner's student breadcrumb reads that parameter and becomes the way
back.

## What is drawn and not wired


Only Compliance leads anywhere; the five others read as normal and simply do
not take a press. Official / Planned toggles and both read the same ruleset. The profile's three actions are
inert. There is no scope select or recompute button — `AuditControls` now takes
`scopes` as optional, because a ruleset is read whole or not at all.
