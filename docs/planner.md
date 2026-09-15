# Planner

Opens at `/planner.html`. Entry: `src/pages/planner.tsx`.

The plan generator's prototype with nothing on offer to generate: the planner,
the term views, the calendar, registration and plan review, on a plan that has
already been made.

## What differs

One thing, passed to `PlanYourPath`: `generators={false}`, which takes Generate
plan off the plan header, Generate Term and Generate Schedule off a term's, and
the assistant's "Generate with Assistant" pill off the panel. The assistant's
own button stays — it is the shell's, not the generator's.

Everything else it has, including the requirements panel behind the sidebar
button and dragging out of it, is the plan generator's.

The plan itself is the same `INITIAL_YEARS` the plan generator opens on, so the
two prototypes start from the same place and can be read against each other.
Everything else is the same components and the same behaviour, so a change to
either prototype's shared parts lands in both. What is meant to differ goes in
`src/pages/planner.tsx`.
