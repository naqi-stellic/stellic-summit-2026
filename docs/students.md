# Students

Opens at `/students.html`. Entry: `src/pages/students.tsx`.

Built from `public/student-search.jpg`, a screenshot of the product taken on
18 Sep 2026, rather than from a frame. The old
[Figma](https://www.figma.com/design/5hj5xjsZUwAuIIsotfbBPP/Master-File?node-id=2-3041)
is on an earlier component set and disagrees with it; the screenshot wins
everywhere they differ.

Reached by clicking **Students** in the staff nav, from any staff surface —
Proactive Compliance, Staff Home or Transfer Insights. It is the screen before
all of them: they open on one student already chosen, and this is where the
choosing happens.

## Three bands, and the order is the argument

**What you can ask.** Keywords on the left, and on the right the twenty filters
the product actually has — Demographics, Programs, Performance, Advisors,
Graduation, Remaining, Planned, Taken, Unmatched, Plan Reviews, Canvas, Status,
Notes, Campaigns, Pathways, Appointments, Requests, Interests, Enrollment,
Transfers — with the Filter Assistant first, because it is the one you reach for
when you cannot name the filter you want.

They are drawn, named, and none of them opens. How many ways in there are is the
information on this screen; what is behind any one of them is a different
screen. Under both sits what is applied right now, each chip a student the
search has been pointed at by name, with Clear All beside them.

**What somebody already asked.** The saved reports, which are the same questions
with the answers kept: *Registered Courses for Fall 2026* at 1854 students and
tracked, *At Risk Students in FIN* at two, *Students who have not Registered for
Next term* at one. Tracked means Stellic is watching the number and will say
when it moves.

**The cohort.** Eighteen hundred and fifty-four people, eight of them on screen.
The count is the point: the list is a sample, not the cohort.

Everybody has a face. Two letters in a coloured disc is what a product shows
when it has nothing, and on a list of eight people it reads as eight labels
rather than eight students — the opposite of what the row is trying to say.

The photographs are in `public/faces/`, from
[randomuser.me](https://randomuser.me), whose portrait set is published for
exactly this: mockups and prototypes. They are held in the repo rather than
fetched, so the screen does not depend on a network at the moment somebody is
standing in front of it. Scott keeps his own.

`StudentAvatar` is still there as the fallback, drawing a face out of four
choices seeded on the username, for the case where an image does not arrive.

## A row

Not "who is this" but "how is this one going". Every column holds its width
down the whole list, because a row is read against the rows above it and a
column that moves cannot be. The name, username and standing, the Stellic
Engage bolts — five of them, lit as far as the record says, off the same figure
the profile card reads — what they are on — with **Not Declared** where a
programme is a plan rather than a record — the CGPA, and then two meters read at
a glance: courses done, under way and still wanted, and milestones the same. A
share of nothing is left off the legend rather than written as a zero.

Under the course meter, the one thing wrong with this record where there is one:
Scott is six credits short of NCAA progress, Jonah has a planned course that is
not offered, Tobias has no graduation application on file.

Scott's name leads through to his record on
[Proactive Compliance](compliance.md). The rest are the cohort he is in.

## The same student on both sides of the click

Team Plan's prototypes open on a plan of their own, and that is fine: they are
about the plan. This side is about the record, and a staff member who opens
Plans from a student's audit has to find the same student on the other side of
it.

So `/planner.html?from=compliance` builds its plan from the audit rather than
from Team Plan's data — `recordPlan()` in `src/data/record-plan.ts`. It reads
the audit's own marks: what is under way goes in the term under way, what is
registered or planned goes in the term after, and the seat the audit is still
holding open stays a placeholder. The incoming credit is the audit's dual
enrollment, which is the same four courses its unmatched list is built from.

Derived rather than written down, so the two cannot drift. Opened on its own,
`/planner.html` is Team Plan's, unchanged.

## What is drawn and not wired

The filters, the saved reports, Actions, sort and the grid view are all named
and inert. The keyword box types, the applied chips clear, the view select
changes, the list/grid toggle moves and the checkboxes tick — everything that is
about reading the list works, and everything that would open a second screen
does not.
