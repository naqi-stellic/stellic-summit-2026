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
held as seats rather than settled on courses. Four seats earlier in the plan
have been filled, and say so — two of them side by side in Spring 2027, above
the seat that has not been. Four requirements have no term at all.

Two kinds of thing can be wrong with a term, which is what the product itself
warns about: you are [missing a
prerequisite](https://learn.stellic.com/stellic-quickstart), or the course is
not likely to be offered that term. Both are read off data the plan already
holds — the prerequisite trees, and the offerings behind the Offered filter —
rather than written down as warnings.

They are not equally bad. A prerequisite that is not met is a course the
student cannot take, so it is red wherever it appears — the banner, the status
in the list, the card on the calendar — it says "Pre-requisites not met", and
registration will not put it through however chosen its class is: no tick
beside it, and not counted in what the button offers to register. Not likely to be offered
is amber: something to get round to. A seat with no course in it is neither —
it says what it is itself, and calling it an error only invites the argument
about whether it is one.

Where a course is drawn, the warning goes with it
([`1865:45317`](https://www.figma.com/design/baNPtCTTnk2E6SMio2xEDz/Plan-2.0-Scheduler?node-id=1865-45317)):
its glyph sits before the course code on the calendar's card, and opening the
course puts it as a banner between the term it is in and the plan's own choices
about it
([`1865:6212`](https://www.figma.com/design/baNPtCTTnk2E6SMio2xEDz/Plan-2.0-Scheduler?node-id=1865-6212)),
which is where you would go to do something about it.

On the term itself each one is a line
([`1388:27475`](https://www.figma.com/design/8BFP4evDj7E5coGDemDrnF/New-Planner---Plan-Review?node-id=1388-27475)):
the course's code in bold, its name, what is wrong with it, and a link at the
end. What is wrong is said in three or four words: which prerequisite, and
where it has got to, is the course's own business, and the link is how you get
there. Where a class is what is missing the link searches for
one; otherwise it opens the course, which is where the rest of the answer is.

Spring 2027 has the red one, in the term registration is open for: a
fourth-year finance course whose prerequisite is three years away, which is the
mistake a planner exists to catch before the window closes. Fall 2027 and Fall
2028 have the other two — Operations planned into a Fall it does not run in,
and Derivatives sitting a year before Investments, which it asks for.

Terms also hold what is not a course. An activity keeps hours the way a class
does, so it is laid out on the week beside the classes and listed under My
Activities — and on the canvas it has a group of its own under the credits
([`1017:192386`](https://www.figma.com/design/8BFP4evDj7E5coGDemDrnF/New-Planner---Plan-Review?node-id=1017-192386)),
because it takes no credits and answers no requirement. It has no code, no
section and no status either, which it has none of.

The term under way carries two of them; Spring 2027, Fall 2028 and Spring 2029
carry one each, far enough apart to say that a plan holds more than courses
without saying it on every card.

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
