# Planner

Opens at `/planner.html`. Entry: `src/pages/planner.tsx`.

The plan generator's prototype with nothing on offer to generate: the planner,
the term views, the calendar, registration and plan review, on a plan that has
already been made.

## What differs

Two things, both passed to `PlanYourPath`:

- `generators={false}` takes Generate plan off the plan header, Generate Term
  and Generate Schedule off a term's, and the assistant's "Generate with
  Assistant" pill off the panel. The assistant's own button stays — it is the
  shell's, not the generator's.
- `initialYears={FILLED_YEARS}` opens on a plan that is already placed.

Everything else is the same components, the same data and the same behaviour,
so a change to either prototype's shared parts lands in both. What is meant to
differ goes in `src/pages/planner.tsx`.

## The starting plan

`src/data/filled-plan.ts` builds it by running the generators at import rather
than by writing a second plan out by hand:

1. `generateDraft` at the steady pace, accepted — four years of courses with
   elective seats held in the nearest terms;
2. `generateTermDraft` over Spring 2028, accepted — the seats in that term
   become real courses;
3. `scheduleTerm(term, SETTLED_WEEK)` over the same term — every class gets a
   section, taken straight down the slot list.

The week comes from `SETTLED_WEEK` rather than from one of the generator's
three, because each of those leans on one part of the day on purpose — that is
how the options tell themselves apart — and a term the student settled
themselves should read as neither. Straight down the list spreads it over four
days and both halves of the day: 9:00 and 10:30 and 1:00 on Monday and
Wednesday, 11:00 and 2:30 on Tuesday and Thursday.

So the two prototypes cannot disagree about the degree: same 40 courses, same
120 credits, same graduation in Spring 2030. Spring 2028 has nothing outstanding
— no "actions required", a full week on its calendar, and all five courses
registrable — while Fall 2028, Spring 2029 and Spring 2030 each keep an elective
seat, which is the work still to do.
