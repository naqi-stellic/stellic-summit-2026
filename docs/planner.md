# Planner

Opens at `/planner.html`. Entry: `src/pages/planner.tsx`.

The plan generator's prototype with nothing on offer to generate: the planner,
the term views, the calendar, registration and plan review, on a plan that has
already been made.

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
