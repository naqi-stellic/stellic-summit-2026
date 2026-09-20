# Planner

Opens at `/planner.html`. Entry: `src/pages/planner.tsx`.

The plan generator's prototype with nothing on offer to generate: the planner,
the term views, the calendar, registration and plan review, on a plan that has
already been made.

## A plan that already exists

The two prototypes open on different plans, because they are demonstrating
different things. The generator opens on a plan with almost nothing in it, so
that generating one has work to do. This one opens on a plan already made
(`src/data/planned-plan.ts`): four years of it, classes chosen as far ahead as
the school publishes them — the term under way and the one after it — and a
last year held as seats.

It is built from the same forty requirements rather than written out again, so
the two prototypes can never disagree about what the degree wants. Each one is
claimed once: a term asks for a requirement by its code and gets the first
nothing has taken, which is what makes two finance elective seats in the same
year two of the three the concentration asks for rather than the same one drawn
twice.

The last year is where the choosing is still to be done, so its electives are
held as seats rather than settled on courses. Two seats earlier in the plan
have been filled, and say so: Cultural Anthropology under a General elective,
Predictive Modelling under the minor's. Four requirements have no term at all.

Fall 2028 is the term with something wrong in it, and each of its two problems
is a different kind: Derivatives sits a year before Investments, which it asks
for, and Operations only runs in Spring. Both are read off data the plan
already holds — the prerequisite trees and the offerings behind the Offered
filter — rather than written down as warnings. A seat with no course in it is
not one of them: it says what it is itself, and calling it an error only
invites the argument about whether it is one.

Terms also hold what is not a course. An activity keeps hours the way a class
does, so it is listed under My Activities and laid out on the week beside the
classes — without a code, a section or a status, which it has none of.

## What differs

One thing, passed to `PlanYourPath`: `generators={false}`, which takes Generate
plan off the plan header, Generate Term off a term's, and the assistant's
"Generate with Assistant" pill off the panel. The assistant's own button stays
— it is the shell's, not the generator's.

Generate Schedule stays, because the scheduler is already a product: it appears
on any term whose week is published, in either view, and nowhere else — not on
the canvas, and not on a term whose calendar is still disabled. It opens
nothing. Scenery, deliberately.

Everything else it has, including the requirements panel behind the sidebar
button, dragging out of it, and the incoming credits above the first year, is
the plan generator's.

The plan itself is the same `INITIAL_YEARS` the plan generator opens on, so the
two prototypes start from the same place and can be read against each other.
Everything else is the same components and the same behaviour, so a change to
either prototype's shared parts lands in both. What is meant to differ goes in
`src/pages/planner.tsx`.

## Opened from a record

`/planner.html?from=compliance` is the same planner standing on a different
student's plan: `recordPlan()` derives the terms from the audit, the nav stays
the staff nav, and the breadcrumb becomes the way back to the record. Opened on
its own, none of that happens and this is Team Plan's planner exactly.
