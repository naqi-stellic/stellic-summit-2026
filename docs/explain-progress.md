# Explain Progress

Team Progress' third prototype. Opens at `/explain.html`. Page in
`src/pages/explain-progress.tsx`, rules and verdicts in `src/data/explain.ts`,
panel and inline card in `src/components/stellic/explain-panel.tsx`.

Built from a static HTML mock. Almost nothing here is new: it is the Progress
screen the what-if reads, with one question added.

## The question

The audit is a verdict. This is the working. Every row already says *what* —
taken, in progress, remaining — and nothing on the page said *why*, which is
the only thing a student argues with.

**The tag is the control.** `fulfill all` is already the name of the
requirement's first constraint, so pressing it opens the rest of them —
underneath the row, indented a level past it, because they are about that
requirement rather than beside it. A second button saying "rules" would have
been naming the same thing twice.

The card is the catalogue's own wording: no marks and no fractions, because it
is what the rule says and not a measurement of anyone.

A rule in a real catalogue is rarely one sentence, and flattening it to one is
how an explanation stops explaining. A `Constraint` carries **notes**, and a
note can carry its own course chips — so "at most 12 units with defined grades,
and here are the ten courses exempt from it" is said in that order, with the
exception nested under the rule it is an exception to, and a list that runs
longer than anyone reads standing up trails off into "+ N more" or "…&nbsp;Show
more".

**The wording is Stellic's own.** Every constraint here is one of the types the
audit editor actually offers — `Take at least [x] credits from a given course
set`, `Take at most [x] credits from a given course set`, `Pass with minimum
grade [x]`, `At most [x] units with defined grades`, `Non-letter grade passed
courses can satisfy this requirement`, `Take [x] courses from the following
attributes`, `Do not count courses from a given set`, `Courses with codes
between [xx-xxx] and [xx-xxx] do not count`, `Same semester or after [y]
credits are earned`, `Up to [x] courses may double count with other
requirements`, `Student must have [x] attributes/tags`, `The requirement is
waived for students with any of these tags`, `May only be satisfied manually by
an institution`, `Only courses from the following sub-requirements can count
toward the units total`. A constraint a student is shown and a constraint a
registrar typed should be the same sentence.

That is also what picks the derived first line: `Fulfill all of the following
sub-requirements` where a requirement holds requirements, `Fulfill any 1 of the
following sub-requirements` where it holds a choice, and `Take at least [x]
courses/credits from a given course set` where it holds courses.

Open Electives gets the one constraint that reads the rest of the audit —
`Take at least 9 credits excluding the given course set`, where the set is
everything already counting. An elective is by definition whatever nothing else
has spent.

General Education is the worked example: six rules, four with sub-clauses, two
naming courses, two of them short.

**explain** opens the panel beside the tree, which is that same wording
measured against this student. It sits on the row, and again in the card's
header — from the card you should not have to go back to the row to ask. In
both places it comes before the search, because it is the thing anyone is
there for.

`explain` and a search sit on every requirement row, and hold their space until
the row is pointed at (`group-hover`, `group-focus-within`) so nothing moves as
the pointer travels down the tree. On a touch screen, where there is no pointer
to travel, they are always out.

## Three kinds of rule

`constraintStatus()` reads the shape of a constraint, and the shape decides the
mark:

| | Marked | Because |
| --- | --- | --- |
| `progress` | an empty red ring when short | the requirement itself — it fails by being unfinished |
| `limit` | green with a fraction | a cap — it fails by being exceeded |
| neither | grey | descriptive. There is nothing to satisfy, so nothing is ticked |

That third row is the one worth getting right. "Courses may double count
without limit with other programs" is not an achievement; ticking it green
would say the student had done something.

The unmet mark is an **open ring with nothing in it**, not a circled
exclamation. The requirement is not finished, which is not the same as
something having gone wrong.

The first constraint is derived rather than written, because it is a claim
about the tree and the tree is right there — and **which** claim comes from the
requirement's own tag. "Fulfill any" is satisfied by one of its children;
"at least 12 credits" is counted in credits; everything else wants all of
whatever it holds. Getting that wrong would put "fulfill all — 1/3" on a
requirement that only ever wanted one.

Everything after it belongs to that requirement and no other. The degree's own
rulebook — the course set, double counting, developmental coursework, the
upper-division floor, the Pass/No Pass and transfer-grade caps — is read out at
the top and nowhere else; printing it under every requirement was what made
them all read alike. Underneath, a requirement says its own thing: Business
Core will not take College Algebra for Business Calculus, General Education
wants two of its eight from outside the College of Business and will not take a
Pass/No Pass, Open Electives will take any course nothing else has claimed —
which is most of the transcript, and is computed from `COUNTING_NOW` rather
than listed.

## Three verdicts

Course mappings read the whole record against one requirement:

- **Counting** — the requirement is using it.
- **Not counting** — a rule is keeping it out, and the row says which, in the
  form the audit uses: *Does not satisfy "Do not count courses from a given
  set"*. Where the rule's own wording is not the reason, the constraint says
  what is: a course blocked from Open Electives is told *"Already counting
  toward another requirement"*, because it has not failed anything — it has
  been spent.
- **Not considered** — everything else, which is most of it. Worded as an
  absence rather than a refusal: the requirement has no opinion about a course
  it was never offered.

Only a refusal owes an explanation, so only "not counting" carries a reason
line. All three are computed — `courseMappings()` walks the requirement for
what it counts and the constraints for what they block — so a verdict cannot
contradict the tree above it.

## What was reused

Nearly everything. `AuditTree` gained one optional `explain` prop carrying a
callback and a render function; without it the tree is exactly what the what-if
renders. `AuditMarkIcon` gained a 16px size, since the mapping list runs at 16
where the tree runs at 24 — the glyph scales off the box rather than there
being a second set of icons. The panel is `AppShell`'s, at the plan generator's
434/320–760, and the assistant's pill reads "Ask about this requirement"
because scoping itself to what is open is the one useful thing it knows.

## What is drawn and not wired

The scope select, the recompute button, the constraint search and the
profile's actions. The four other tabs are drawn but greyed and do not press.
The mappings search works.
