# Advanced What-If

Team Progress' prototype. Opens at `/advanced-what-if.html`. Page in
`src/pages/advanced-what-if.tsx`, audit model and sample in `src/data/audit.ts`,
the tree in `src/components/stellic/audit-tree.tsx` and the cards above it in
`src/components/stellic/student-profile.tsx`.

Figma: [`2274:20653`](https://www.figma.com/design/prhu0x6AaQF2AVtLBFoDq3/Audit-Profile-Planner?node-id=2274-20653)
(Student - Free Elective).

## What this screen is

Screen one, and nothing on it is hypothetical yet: it is a student's progress
against the degree they are actually on. It comes first because a what-if is
only legible against it — every question the prototype goes on to ask is "what
would this tree look like instead", and there has to be a *this* to answer
against.

So the audit is built to be re-run, not just drawn. The rows are a tree of
`AuditEntry`, the marks are one function of a state, and every figure above the
tree is counted off the tree. Swapping the programs at the top should be a
change to `AUDIT`, not a second screen.

## The same student as Team Plan

Scott Abott, on the 120-credit Business Administration B.S. with a Finance
concentration — the Team Plan prototypes' student and degree, read from the
other end. Team Plan asks "which term does this go in"; the audit asks "does
the degree accept it".

`DEGREE` and `STUDENT` are imported from `src/data/plan.ts` rather than copied,
so the program name, the credit total, the requirement count and the milestones
cannot drift between the two products. Every course in the tree is one the plan
holds or still owes, and the forty requirements split exactly as the planner
has them:

| | |
| --- | --- |
| 10 taken | the finished 2026-2027 year |
| 5 under way | Fall 2027 |
| 1 registered | FIN 340, whose class is chosen |
| 1 planned | the Finance elective seat in Spring 2028 |
| 23 outstanding | `REMAINING_REQUIREMENTS` in `src/data/catalog.ts` |

The four dual-enrolment courses the student came in with are the **unmatched
courses**: real credit the degree asked for none of, which is what that section
is for and why the planner shows the same four above its first year.

Names are the ones a registrar would print — "Business Core", "Finance
Advanced", "Complete your declared concentration" — with no catalogue codes
trailing the requirement names.

## Numbers

`auditStanding()` walks the tree, counts rows by mark, and every tally on the
page comes from it: the red counts on the degree row, the Courses bar and its
legend, the bar on the degree row, and both halves of the Official / Planned
toggle. The bar cannot say anything the audit does not.

Two rules make that count come out right. Additional checks — Residency and 120
Total Credits — are `restated: true` and stepped over, because they re-list
courses counted elsewhere and walking into them would count those twice. And
registered and planned sit with the remainder rather than with what is earned,
because on a bar about what the degree still wants, a seat you have booked is
still a seat you owe.

Milestones are `DEGREE.milestonesDone` of `DEGREE.milestones` — 3 of 13.

## The tree

Every row is the same three parts — the trail that says where it sits, the mark
that says how it stands, and the row.

The audit card pads itself by 24 and nothing inside it adds a second inset: the
degree row, the unmatched heading and the Discover banner all stand on the same
left edge, and every row runs to the same right one. A `TreeElement` has no
indent of its own — depth is the trail's business.

The three blocks are 40 apart, which is the same 40 whichever pair you measure.
They are three separate things sharing a card, and at the rows' own 8 they read
as one list that changes its mind twice.

**The trail** is one 40px cell per level above the row, with a 1px line down
each cell's middle (`--stellic-divider`, `#e4e7ec`). The line overruns its row
by the 8px gap between rows, so it reads as one line running behind the tree
rather than a dash beside each row.

A branch that carries on meets its row square — it is a T, and the line goes
past. A branch that ends turns into its row on an 8px radius and stops there,
drawn as a bordered box with `rounded-bl-lg` rather than two lines meeting, so
both strokes land on the same pixel grid. That corner is the only one in the
tree, and it is the whole of how you see, glancing down the left edge, where a
group finishes. Both stop 4px short of the cell, which is the gap the row
leaves in front of itself.

Which lines continue is the one thing the renderer has to know that the data
does not say, so `EntryRows` carries it down as `stem`.

**The mark** is a 24px square: a ground and a glyph, and that is the whole
vocabulary. Taken is a green check, in progress a green clock, registered an
orange calendar, planned an amber outlined check, remaining an empty red box,
and optional a grey box struck through — a rule rather than a box to fill.

**The row** differs only in its ground: a requirement sits on grey, a course on
white with a border, and the degree on nothing at all, because it heads the tree
rather than hangs off it. An elective seat leaves the code column empty — the
requirement is settled and which course answers it is not.

There are two levels, not three. A row naming the concentration used to sit
between the degree and its requirements, and it said nothing the rows under it
do not: the concentration is already there in *Complete your declared
concentration → Finance*, with its core, its advanced list and its electives.
So the degree heads the tree directly and took the two things that row was
carrying for it — which catalogue version it is being read against, and the
PGPA. `AuditGroup.level` is `degree | requirement`, and everything under the
degree is a requirement.

## Icons

The audit screen draws its own 16px outlines rather than scaling Material's 24px
grid down, and in several places they are *different glyphs*, not smaller ones:
the campus mark is a pin, not a folded map; the level tag is an outlined tag,
not a filled one; the mortarboard is drawn in strokes; the toggles carry a
filled disc where a heading carries an outlined `info`; and "last computed"
carries a stopwatch. Those are traced from the frame's own exports into
`src/components/icon.tsx` under a `Stellic 16px set` heading, the way the rest of
the icon set was. Everything in the tree is an outline — a solid flag or a solid
clock reads as a different state at 16px.

## Discover other programs

Figma: [`3972:24241`](https://www.figma.com/design/prhu0x6AaQF2AVtLBFoDq3/Audit-Profile-Planner?node-id=3972-24241).

The banner at the foot of the audit, under the courses the degree had no use
for, which is where the question occurs to you: this degree is accounted for,
so what would another one make of the same transcript. It is the way into the
what-if, and the first piece of that feature to land —
`src/components/stellic/discover-programs.tsx`, which is where the rest of it
will grow.

That frame is a JPEG pasted onto the canvas rather than a drawn component, so
there is nothing to read tokens off. It is rebuilt from the design system
instead, and the two numbers worth knowing were measured off the image: the
banner is 82px tall on 32/20 padding, and its rule is `primary-5` rather than
the info `Alert`'s `primary-100` — sampling the reference puts it around
`#cce3fc`, and in any case a plan's banner is telling you something where this
one is offering, and a dark edge round an offer reads as a warning.

It is a `button`, not an `Alert`: `role="alert"` would have a screen reader
announce it on arrival, and nothing here has happened.

## The Discover Programs panel

Figma: [`3972:24242`](https://www.figma.com/design/prhu0x6AaQF2AVtLBFoDq3/Audit-Profile-Planner?node-id=3972-24242)
(step 1).

The banner opens it beside the audit through `AppShell`'s `panel` prop, not
over it: the question is "what would this tree look like instead", so the tree
has to stay in sight while it is being asked. The audit's card scrolls
sideways inside the narrowed pane rather than crushing its rows.

Its chrome is the Generate Plan wizard's, deliberately. A student who has used
one has used the other, and a second kind of side panel would be a second thing
to learn for no reason — same header, same step counter, same progress bars,
same pair of full-width buttons at the foot. What differs is the question.

Step 1 asks what the student is here to do: add a major, change one, or just
look. The answer is what decides what step 2 asks, which is why it is asked
first, and Continue stays disabled until it has one.

The frame is a sketch rather than a drawn screen — it counts four steps where
there are two, and has nothing behind the second — so the content is the
sketch's and the shape is the wizard's. Step 2 says there is no design behind
it yet rather than inventing one, and keeps the way back.

The options stack their sentence under their label rather than beside it, which
is why they are not `RadioCard`: that card puts the two on one row, which works
only while the line is four or five words.

## What is drawn and not wired

Everything on the page is the frame's, and almost none of it acts yet — there is
one screen, so there is nowhere for anything to go:

- the five tabs switch, but only Progress has a design behind it; the other four
  say so rather than pretending;
- Official / Planned switches and lights up, and both read the same tree, since
  there is no second audit to compute yet;
- the scope select, the recompute button, the unmatched filter, Request to
  Review Plan and Actions are all drawn and inert;
- Discover other programs takes an `onOpen` and has not been given one yet.

A requirement's chevron does work: it folds the group. `collapsed: true` in the
data says which groups the page opens folded — the two elective groups, because
a list of seats has nothing to read, every row of it saying the same thing, so
the requirement states how many credits it wants and keeps them behind the
chevron. After that the fold belongs to whoever is reading, not to the data, so
`AuditTree` holds it in state rather than writing it back.

Folding hides rows; it does not remove them. `auditStanding()` walks the data,
so the tallies above the tree are the same whether a group is open or shut.

## Shared chrome

Two seams were added to the shell rather than a second copy of it:

- `AppShell`'s `section="progress"` stands the sidebar on Track Progress and
  closes Schedule down to one row. The nav is otherwise the plan prototypes'
  nav, in the same order — `src/components/layout/sidebar.tsx` builds both from
  one list and only opens Schedule onto its terms where a term is the thing you
  came to work on;
- `assistant={false}` takes the floating assistant off, because this frame does
  not draw one. It is the shell's button, not a prototype's, so the prototype
  has to say it does not want it.

`--shadow-card` and `--stellic-divider` were added to `src/index.css`: Figma's
Small Shadow, which is lower and tighter than the `shadow/sm` the plan surfaces
use, and the Dividers Gray the trail lines run in.

## Responsive

`main` is the `@container`. The content column is the frame's own 1518px,
centred, so at 1920 it sits 81px clear of the nav on both sides exactly as the
frame does. Under that the cards wrap: the three-card network row breaks to one
per line, the Milestones bar drops under Courses, and the audit tree scrolls
sideways inside its card rather than crushing the rows, because a tree whose
indentation collapses is no longer a tree.

## Departure from the frame

The bars are shares of real counts rather than Figma's pixel widths — the same
trade the plan generator makes, and for the same reason: a bar that cannot move
is a picture of a bar. Everything else structural lands where the frame puts it.
