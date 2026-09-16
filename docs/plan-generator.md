# Plan Generator

A term-by-term degree planner. Opens at `/generator.html`. Page in
`src/pages/plan-your-path.tsx`, plan model and its moves in `src/data/plan.ts`,
planner components in `src/components/stellic/`.

Figma: [`209:35392`](https://www.figma.com/design/6BmYq3FqAnCpTZwzZ5DFcH/Plan-Generator?node-id=209-35392)
(page) and [`361:165640`](https://www.figma.com/design/6BmYq3FqAnCpTZwzZ5DFcH/Plan-Generator?node-id=209-37071)
(Generate Plan panel).

## Drag and drop

Planned courses can be picked up and dropped into any other planned term
(`@dnd-kit`). Registered terms are locked — `Term.locked` — so their courses
have no handle and can't be moved, and nothing can be dropped into them.
Hovering a movable course reveals what can be done to it, at the end of the
row: a note and a remove button, with a search button before them on a held
seat. Only the search button is there when the row is not hovered.

Collision detection is `pointerWithin` rather than `closestCorners` on purpose:
`closestCorners` always resolves to *some* droppable, so releasing over a locked
term would quietly drop the course into a neighbouring one. `pointerWithin` only
reports droppables the cursor is actually inside, so an invalid drop resolves to
no target and the course snaps back.

`moveCourse` and `removeCourse` own the state transitions and re-check `locked`
themselves, so the rule holds even if a future caller skips the UI.

## Adding a term

A year runs fall, spring, summer, and only the summer is optional — so "Add
Term" adds that
([`1020:250321`](https://www.figma.com/design/8BFP4evDj7E5coGDemDrnF/New-Planner---Plan-Review?node-id=1020-250321)),
after the spring, and stops offering once the year has one. A year already
behind you never offers it. The new term is a term like any other: it takes
drops from the plan and from the requirements panel, it opens on its own, and
it appears in the year filter's menu.

## Sample data

Figma is the source for layout, not content — its placeholder data contradicts
itself — so the sample plan is invented to hold together. The story: a student
who started Fall 2026 on a 120-credit, 40-requirement Business Administration
B.S. with a Finance concentration and a Data Analytics minor — the pair being
the point: no pathway is built for every programme, concentration and minor
there could be. Three of the outstanding requirements answer to the minor
rather than the major (MIS 250, STAT 320 and a data elective seat), so it is
real in the plan without changing the forty or the hundred and twenty. They finished 2026-2027 (10 courses, 30
credits), are partway through Fall 2027, have started planning Spring 2028, and
the plan runs out to 2029-2030. Courses are 3 credits each.

Above the first year sits Incoming Credits
([`1393:60657`](https://www.figma.com/design/8BFP4evDj7E5coGDemDrnF/New-Planner---Plan-Review?node-id=1393-60657)
for the shape it started as): what the student arrived with, folded away like
the year below it. Three cards in a row — Transfer Credits, Exam Credits, Pre-Year 1 — each
saying what it earned, with its rows carrying what was brought in rather than
what it stands for here: another college's course and the college that taught
it, an exam and the score it was passed at. Which of our requirements they
answer to is the audit's business. Pre-Year 1 is different in kind — those are
courses of this campus, taken before the first year — so its rows read like any
other course of ours, minus the class. It is not a year and it holds no terms: none of this was taken
on a timetable this plan knows about, so `src/data/incoming.ts` keeps it as
what it is rather than as two invented semesters.

The total is said beside the heading. Each row's credits are a tag like any
other detail, so they answer to Plan details and are not there until it asks
for them; what stays on the row is the one fact the kind is worth knowing by. Those credits are extra rather than
requirements, so the degree's forty and its hundred and twenty are untouched
and the generator has the same work to do. Make them count instead by folding
them into `COMPLETED` and striking the matching entries off
`REMAINING_REQUIREMENTS`.

Spring 2028 holds one course and one seat: FIN 340, whose class has been chosen
and which is ready to register, and a Finance elective with no course against
it. So the term reads "1 action required" — the seat — and one of its two
things can go through registration while the other cannot.
FIN 415 is on the outstanding list rather than in the plan, and one of the two
concentration seats is in the plan rather than on the list — the totals are the
same either way.

Anything visibly derived from that — year filter tabs, the "+ Add Year N"
label, expected graduation, the registration deadline — comes from the plan
rather than being written down separately. Adjust `DEGREE`, `COMPLETED` and
`INITIAL_YEARS` in `src/data/plan.ts` and the rest follows.

## Numbers

Every figure on screen derives from the plan rather than being written down
twice. Courses carry `credits`; a term's credit heading and its "Sep - Dec ·
12 credits" line sum their own courses; and the Generate Plan panel's standing
comes from `planStanding()` — completed from the finished `COMPLETED` year,
planned from everything currently sitting in the editable plan (registered
terms included, since those credits are not earned yet), remaining as the
balance against `DEGREE`. Requirements are one per course, which is what makes
"6 reqs · 18 credits" read consistently.

So the panel tracks edits: drop a 3-credit course and Planned falls from 18 to
15 credits, Remaining rises to 81, the term heading and its meta line drop by
3, and the bar's orange segment narrows. The bar's segments are shares of the
degree's credits rather than the design's fixed pixel widths — the one place
the numbers being real costs a literal match to the frame.

Expected graduation is the last term the plan reaches, not a stored date.

## Two kinds of instructions

The student writes theirs in the instructions step. The school's are read back
in the summary, as one more row under "Also accounting for" beside the settings
it already lists: `INSTITUTION_INSTRUCTIONS` for a plan or a term — core before
general, prerequisites, double counting, what the catalogue reaches, the credit
ceiling — and `SCHEDULE_INSTITUTION_INSTRUCTIONS` for a week, about seats,
campus, clashes and classes already chosen. Two lines each, built from
`PLANNING_RULES` and the scheduler's own rule rather than written out twice.

## Generate Plan panel

"Generate plan" toggles a side-by-side wizard
(`src/components/stellic/generate-plan-panel.tsx`) through `AppShell`'s `panel`
prop. The drag handle *is* the 4px rail the design already draws between the two
columns rather than an extra divider. Sizes are pixels in react-resizable-panels
v4, so they are the design's own numbers: the panel opens at 520px, clamps
between 340 and 760, and the planner keeps 520px.

**Step 1** shows Courses and Milestones progress, the plan summary, and a
keep-or-choose radio. Every figure comes from `planStanding()` — the tallies,
the bar shares, and the "Keep my N courses" copy — so Figma's own numbers there
are placeholders that were deliberately not copied.

**Step 2** sets pacing: Full-time, Part-time, or Custom. Custom expands in place
to a credits-per-term stepper and two term filters. Both filters are off by
default; switching one on reveals a search field that opens its options on focus
and collects picks as removable tags (`TermMultiSelect`, built on shadcn
`popover` + `command`).

The terms on offer come from `selectableTerms()`: every term in the plan that is
not already under way, **plus the summers**, which the planner canvas never shows
but a student can still choose to study through. So the list runs Spring 2028,
Summer 2028, Fall 2028 … Summer 2031 — eleven terms, where the canvas shows
eight.

**Step 3** is a free-text box for anything the generator should know.

**The summary** then reads the answers back. Its "Your choices" rows are not
re-stated copy — Keeping comes from step 1's radio, Pacing from
`describePace()` over step 2's state (so it grows "exclude: Summer 2029, Fall
2030" only when those were actually picked), and Anything else from step 3's
box. Answers live on the panel, so Back never loses one and Start over clears
them all.

The rows beneath, under "Also accounting for", are institution settings rather
than answers: `PLANNING_RULES` in `src/data/plan.ts`, except Existing credit
and Campus, which are summed and collected from the plan. The credit ceiling is
shared — `PLANNING_RULES.maxCreditsPerTerm` is both what the summary reports and
what step 2's stepper clamps to, so the two can't contradict each other the way
the frame's "max 30 per term" pacing and "max 18 per term" limit did.

Generate Plan itself does nothing yet — there is no design for what follows.

## Plan review

Figma: [`1017:234293`](https://www.figma.com/design/8BFP4evDj7E5coGDemDrnF/New-Planner---Plan-Review?node-id=1017-234293)
(pick terms), [`1017:234286`](https://www.figma.com/design/8BFP4evDj7E5coGDemDrnF/New-Planner---Plan-Review?node-id=1017-234286)
(pick request), [`1017:234450`](https://www.figma.com/design/8BFP4evDj7E5coGDemDrnF/New-Planner---Plan-Review?node-id=1017-234450)
(notes), and the submitted state on the plan
([`1017:234461`](https://www.figma.com/design/8BFP4evDj7E5coGDemDrnF/New-Planner---Plan-Review?node-id=1017-234461))
and on a term
([`1017:240068`](https://www.figma.com/design/8BFP4evDj7E5coGDemDrnF/New-Planner---Plan-Review?node-id=1017-240068)).

"Request review" opens a three-step dialog: which terms, what kind of request,
and anything to say with it. Opened from a term the first step is already
answered — the term is the request — so it opens on the second, and its corner
closes rather than going back.

Only terms still ahead are on offer. A term under way or already taken cannot be
reviewed: whatever an advisor would say about it, it has happened. That leaves
Spring 2028 onwards; Fall 2027 is locked and the 2026-2027 year is done.

Submitting does three things: the plan takes a pending banner, every term in the
request takes a `PENDING REVIEW` mark (the same slot that says `REVIEWED`), and
the reviews panel opens beside the plan. A term's mark sits beside its name in
the term view and on its card in the planner; both read it from one context
rather than having it threaded down.

The panel is the frame at
[`1096:66987`](https://www.figma.com/design/8BFP4evDj7E5coGDemDrnF/New-Planner---Plan-Review?node-id=1096-66987):
one white card on the page's own grey, lifted by Figma's shadow/sm (added to
the theme as `--shadow-sm`) and framed by nothing — the tab strip is the top of
the card, and the requests are ruled sections under it. The
card runs a rail down three 24px markers — asked (green), with the advisor
(amber), complete (open) — against the reference plan and the terms. What the
advisor has to do and the button that closes the request are theirs, not the
student's, so neither is drawn here; Cancel Request is.

A request records where every course sat when it went out, so "N changes during
review request" and the Changes tab's count are the plan measured against
itself rather than a number kept by hand.

`src/data/review.ts` holds the request types, the advisor, and one request that
has already been round — which is why Fall 2027 carries a reviewed mark, and
what the panel's history row is.

Departures from the frame: the term groups are headed with the plan's own year
labels (`2027-2028`) rather than "Year 1", since that is what every other
surface here calls them; and the Changes and Graduation Clearance tabs are drawn
but empty, there being no design for either.

## A seat on its own

Figma: [`1017:207673`](https://www.figma.com/design/8BFP4evDj7E5coGDemDrnF/New-Planner---Plan-Review?node-id=1017-207673)
(the seat) and
[`1017:208517`](https://www.figma.com/design/8BFP4evDj7E5coGDemDrnF/New-Planner---Plan-Review?node-id=1017-208517)
(the search it opens).

Clicking a held seat opens it beside the plan: what it is holding a place for,
the term holding it, the note it has not got, and the credits it stands for.
The seat itself is outlined while its panel is open. "Find eligible courses"
turns the panel into the course search — the courses that could fill this seat,
a finance one for a finance seat — and "Back to …" returns. The seat's own
search button goes straight there.

The search is a list, not a search: nothing filters it, and the count beside
its heading is the design's. Choosing a course from it is not wired either —
a seat is filled by generating the term, or by dropping a course on it.

## Add remaining courses

Figma: [`1017:189481`](https://www.figma.com/design/8BFP4evDj7E5coGDemDrnF/New-Planner---Plan-Review?node-id=1017-189481).

The sidebar button in the toolbar opens what the degree still wants: the shares
of the forty requirements — taken, planned, still to place — the milestones
beside them, and then the outstanding requirements grouped the way the degree
asks for them. Each row is dragged out of the panel and dropped into the term
it is going to be taken in, which is the same move as "+ Add to Term" and lands
the same card.

The drag context wraps the whole shell rather than the planner alone, because a
row is picked up in the panel and let go over a term and both ends have to be
inside it. A requirement has no place in the plan to leave, so it is always
added at the end of the term it lands on, and the drop preview says so.

A requirement leaves the list once it has a term. A course is recognised by its
name wherever it was placed from; a seat cannot be — every seat reads alike —
so a placed seat remembers which outstanding requirement it answers, and the
generator's seats remember it too. That is what keeps the three shares summing
to forty: after generating the whole plan the panel reads 10 taken, 30 planned,
0 to place.

The panel's refresh button is not built: there is nothing behind it to re-read,
the list being derived from the plan on screen.

## What a generated schedule moves

A class the student chose stays where it is: `PlannedCourse.settled` marks one
picked by hand — Spring 2028's FIN 340, and anything settled through "Search
sections" — and a run fills the term's unscheduled courses around it rather than
moving it. Its hour is struck off the option's order so nothing lands on top.

A class an earlier run proposed carries no such claim, so generating again
times it afresh and draws where it used to be behind it. That is what "Compare
with current schedule" has to show, and why a first run over a term nobody has
timetabled shows no ghosts at all.

No slot is shorter than an hour and a quarter — eighty pixels — which is what a
block needs for its code, its name and its section.

## Responsive

`main` is the `@container`. Term cards sit side by side above `@3xl` (768px of
planner) and stack below it. The wizard is its own container, so its label/value
rows stack once the panel is dragged under 320px. The registration banner wraps
its closing date to a second line rather than truncating, growing from 92px to
120px when it does.

The sidebar stays a fixed 240px at every width; collapsing it is not wired up yet.

## Fidelity

Diffed against a 1:1 export of the Figma frame at 1920×2184. Every structural
landmark — card borders, row borders, section offsets, the timeline rail — lands
on the same pixel; the residual ~0.8% differing pixels are text antialiasing
between Figma's renderer and Chrome's. With the panel open the split measures
1242 / 4 / 434, matching the frame exactly.

`reference/index.html` is the original static build, kept as the baseline the
React app was verified against. It has no dependencies — open it directly.

Deliberate departures from the frame:

- the sidebar's help block is pinned to the bottom of the viewport (in Figma the
  nav column overruns the artboard, so it falls below the fold);
- the 4px scroll track on the right edge doubles as the resize handle;
- the FAB keeps a 40px right margin in both states rather than shifting 10px
  when the panel opens;
- the registration banner's Register Now button sits 4px higher than the frame,
  because 92px is now the banner's natural height rather than a fixed one it
  could not grow past.
