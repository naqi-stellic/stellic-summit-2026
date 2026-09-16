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

Point at a requirement and two things appear:

**rules** opens the catalogue's own wording underneath the row, as a row of its
own indented one level past it — it is about that requirement, not beside it.
No marks and no fractions: it is what the catalogue says, not a measurement.

**explain** opens the panel beside the tree, which is the same wording measured
against this student.

Both hold their space until the row is pointed at (`group-hover`,
`group-focus-within`), so nothing on the page moves as the pointer travels down
it, and both are always visible on a touch screen, where there is no pointer to
travel.

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

The first constraint on every requirement is derived rather than written:
"fulfill all of the following" is a claim about the tree, and the tree is right
there — so it counts whatever the requirement actually holds, its courses where
it holds courses and its sub-requirements where it holds those. The rest are
catalogue facts and are written down, but the courses they name are real ones
off this student's record, which is what lets a mapping cite them.

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
