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
| `progress` | red when short | the requirement itself — it fails by being unfinished |
| `limit` | green with a fraction | a cap — it fails by being exceeded |
| neither | grey | descriptive. There is nothing to satisfy, so nothing is ticked |

That third row is the one worth getting right. "Courses may double count
without limit with other programs" is not an achievement; ticking it green
would say the student had done something.

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
- **Not counting** — a rule is keeping it out, and the row says which. Here:
  MATH 110 and ENGL 100 against *"Developmental coursework does not count
  toward the degree"*.
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

The other four tabs, the scope select, the recompute button, the constraint
search and the profile's actions. The mappings search works.
