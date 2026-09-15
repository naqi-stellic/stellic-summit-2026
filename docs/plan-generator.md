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
Hovering a movable course reveals a × that removes it.

Collision detection is `pointerWithin` rather than `closestCorners` on purpose:
`closestCorners` always resolves to *some* droppable, so releasing over a locked
term would quietly drop the course into a neighbouring one. `pointerWithin` only
reports droppables the cursor is actually inside, so an invalid drop resolves to
no target and the course snaps back.

`moveCourse` and `removeCourse` own the state transitions and re-check `locked`
themselves, so the rule holds even if a future caller skips the UI.

## Sample data

Figma is the source for layout, not content — its placeholder data contradicts
itself — so the sample plan is invented to hold together. The story: a student
who started Fall 2026 on a 120-credit, 40-requirement Business Administration
B.S. with a Finance concentration. They finished 2026-2027 (10 courses, 30
credits), are partway through Fall 2027, have started planning Spring 2028, and
the plan runs out to 2029-2030. Courses are 3 credits each.

Spring 2028 holds one course and one seat: FIN 340, which has no section yet,
and a Finance elective with no course against it. They are the two kinds of
outstanding work a term can have, which is why the term reads "2 actions
required" and why nothing in it can be registered until one of them is settled.
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
