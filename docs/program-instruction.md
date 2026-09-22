# Program Instruction

`program-instruction.html` · `src/pages/program-instruction.tsx`

The third Team Plan prototype, and the first of them standing on the staff side.
New Planner and Plan Generator are a student arranging their own terms; this is
the desk the programme those terms are arranged against is written at.

Built from a screenshot of the product rather than a frame, so the shape of the
screen is the product's: two bands, four filters, a grid of catalogue entries.

## Where it lives

The staff nav, standing on **Programs**. It is a page of its own rather than a
tab hung off Staff Home because Programs is its own row in the real nav, and a
prototype should be reachable the way the real thing is — the row you are
standing on is half of what tells you where you are.

Everything around the middle is `AppShell`'s, with `section="staff"` and
`navCurrent="Programs"`. The content column holds to 1200px, the width Students
and the staff audit already hold to.

## What is on it

The catalogue the rest of the suite already runs on, read from the other side.
`src/data/program-instruction.ts` takes the programs `PROGRAMS` holds — the ones
Advanced What-If offers a student, the ones a plan is run against — and asks a
different question of them: not what this is worth to somebody, but what state
it is in.

Twenty-seven, on this page. Two entries are not in `PROGRAMS`:

- **Business, B.S.**, the degree every other prototype stands on. What-if leaves
  it out by design — it offers a student the programs they are *not* on — and
  its requirements are written as an audit in `audit.ts`, the tree Scott is read
  against.
- **Computer Science, B.S.**, a degree the institution runs that no prototype
  has yet had a reason to write requirements for.

Both belong here anyway: a registrar's catalogue is the list of everything the
institution runs, and one that left out the degree most of its students are
enrolled in would be a catalogue nobody could use.

Two are left out. **Business Analytics** the certificate and **Business
Analytics, B.S.** sat either side of the degree the whole suite is about, and
three entries within two words of each other read as a catalogue that cannot
keep its own names straight. They are still in `PROGRAMS`, where what-if offers
them.

Business sits at the head of it rather than filed under B. The rest is
alphabetical with one exception — everything starting with **A** goes last.
Alphabetical from the top opened the catalogue on Accounting, Accounting again
and Art History, and the first row of a grid is the only part of a list of
twenty-seven that gets read without scrolling.

**Asking**, in one card. Keywords beside the four filters, and under the rule,
what is currently asked. Three of the four filters are the ones Advanced What-If
already asks of the same catalogue — Offered By, Type, Level — because those are
questions about a program rather than about a screen; the row itself is the
planner's own `FilterBar`. **Audit Status** is this screen's own, and it is the
only one of the four that is about the state of the work rather than the shape
of the entry.

Nothing selected, the band under the rule says **No Selected Filter** rather
than standing empty: an empty band under four buttons reads as something that
failed to load. Selected, it holds the chips — which is why `FilterBar` now
takes `chips={false}` and exports `FilterChips`, so a page can put them
somewhere other than under the buttons.

The funnel beside **Filters** is the same mark the student search carries, on
the same heading, so the two staff screens that ask a question ask it the same
way.

**What it left**, in the second card. The count names what it counted —
`programNoun` again, so filtering to minors says "15 minors" and not "15
programs" — and then a card per entry.

### The card

What it is, what it is called, the two counts, and the department that runs it.

The name is the catalogue's own and nothing else: "Accounting, B.S.", "Data
Analytics" — exactly as Advanced What-If writes it and as the plan header says
it. One name for a program, everywhere in the suite. Two earlier versions of
this card said it differently — one rewrote it as "B.S. in Accounting", one hung
the SIS code off the end as "[BS-ACCT]" — and both were a second way of saying
something the suite already says one way.

The counts are the page. The green pill is how many versions of this program's
audit are published, the red one is how many drafts are open against it, and
both are read off one list of versions rather than stored as numbers — so a
program cannot say it is up to date while a draft sits on it.

The foot of the card is the department and nothing under it. Every entry belongs
to the same institution, so naming it on every card was a line that never varied
and never said anything.

The card takes gray-0 on hover, and the whole of it opens the entry.

Sub-plans get a line where a program has them: **Concentration: 3**,
**Emphasis: 2**, **Specialization: 4**. Three words for one idea, because the
colleges that run them do not agree on which word it is, and flattening them
into "sub-plan" would be inventing a term the institution does not use. The mark
beside the count names them.

## What is written down and what is worked out

Almost everything on a card comes out of the catalogue entry: the name, the
type, the department, the counts.

One thing cannot be:

- **The work.** Which audits somebody has versioned back to the previous
  catalogue, and which drafts are open against the next one. That is a work log,
  not a rule, so it is written per program — and where the work is, is the
  point: the business programs carry the drafts, because the 2026–27 revision
  started with the college the planners' student is in.

The keyword box searches the name, the department and the school, and its
placeholder says so. The product offers "created by" there; this catalogue has
no record of who wrote an entry, and a box that offers a search it cannot run is
worse than one that offers less.

`2025–26` is what students are audited against today; `2026–27` is the one being
built, which is where every draft on this page sits.

## Opening one

A card is the way in — the whole card, so there is nothing on it to hit
separately. The way back is **Programs** in the nav, which now points at this
page: it is the row the page is standing on and the one somebody reaches for
anyway, so there is no breadcrumb above the entry saying the same thing in
smaller type.

What opens is the registrar's side of the audit the students' prototypes
read: the same requirements, in the same order, with the student
taken out. What the degree asks for, rather than how far one person has got
through it.

Three tabs, because an entry is three things to the person maintaining it. The
strip is the student profile's — `RecordTabs`, now shared: same 150px tabs, same
indicator sitting in the strip's own rule, same room above it. Two staff record
pages, and a staff member learns the way between tabs once.

**About** is the audit. A version picker at the top — it opens on the newest
published version, because a draft is the work and not the answer — then the
program, the two rules every audit in the catalogue is built under, and the mode
average credits, which is three because every course in this catalogue is three
and the **Auto** mark beside it is claiming exactly that. Then the parent
requirements, collapsed — the name and the chevron that opens it, and nothing
else. The tags the audit carries (*fulfill all*, *at least 9 credits*) are what
a requirement asks of a student; this is a list of what the degree is made of,
and seven rows saying "fulfill all" seven times is a column of noise between the
names and the way into them. They stay on the requirement for whatever opens it
next.

Opening a row is the audit's own nesting, minus the lines. The requirement grows
what it actually asks — the tags said as the sentences they are short for
("fulfill all" → *Fulfill all of the following requirements*, "taken last" →
*Taken in the final term*), and its own mode average credits — and the courses
appear beside it rather than inside it, each on a card, indented under the row
that wants them. That is what lets a requirement still be read with forty
courses open underneath it. A requirement that names no courses says so, because
one the whole catalogue answers is not an empty one.

**Business' seven requirements are not written down anywhere.** They are
`programUnder(AUDIT).children` — the tree Scott is read against, with the marks
and the results left off. An audit is a catalogue entry somebody has been run
through, so the catalogue entry is the audit with nobody in it, and the two
cannot drift apart. Everything else in the list uses its own `requirements`;
Computer Science, which no prototype has ever had to answer a question about, is
written out in full.

**Audits** is one version rather than a list of them. The picker at the top is
the same picker About carries, over the same piece of state — they are two
readings of one choice — and under it is everything that is true of the version
and not of the program: whether it is published, who published it and when, what
can be done to it, how many students it audits and which entry years it takes.
Then the same requirements underneath, because a version *is* a set of
requirements.

Both numbers move with the picker. **Entry year** is read off the version's own
name: the newest published one takes everybody who has arrived since, an older
one keeps the year it was written for because the year after it has a version of
its own, and a draft says what it will take once it is published. **Applies To**
counts the roster — students on this program who arrived under this version — so
a draft is nobody's and says `0 students`. The roster is a sample of 1,854, so
the number is a real count of the students this prototype knows about rather
than an institutional total.

**Planning** is where a program is prepared for the Generator, and it is the one
tab that is about work not yet done rather than work already published.

Figma: [`453:207125`](https://www.figma.com/design/6BmYq3FqAnCpTZwzZ5DFcH/Plan-Generator?node-id=453-207125).

**Planning instructions** is context written on the program rather than on a
student — the Generator reads it when it builds a plan against this program.
Nothing is written yet, so the section says what it is for and offers **Add**
rather than showing an empty list.

Figma: [`450:198979`](https://www.figma.com/design/6BmYq3FqAnCpTZwzZ5DFcH/Plan-Generator?node-id=450-198979).

**Add** opens the box in place rather than in a dialog: what is being written is
about the thing on the page, and a dialog would cover the pathways it is meant
to produce.

Clicking into the empty box fills it, and fills it *whole* — see the README,
"Fields that fill themselves in", where this is the exception to the rule.
Everywhere else in the suite a field that fills itself in is somebody typing a
sentence they are composing on the spot, so it types at a person's speed. This
is three paragraphs of course advice that already existed somewhere else: nobody
composes that into a form, they write it down over months and paste it in when a
place to put it finally exists. So it arrives at once, and what the prototype
simulates is a paste.

Save is grey until there is something to save. Saved, the instruction stands
under the blurb clamped to three lines with **Show more** under it — what is
written there is a reference document, and the point of it is that it is long,
so a page that opened on all of it would be a page about the instructions rather
than about the program. The button becomes **Edit**: nothing written is
something to add, something written is something to change.

Figma: [`450:199409`](https://www.figma.com/design/6BmYq3FqAnCpTZwzZ5DFcH/Plan-Generator?node-id=450-199409).

**Pathways** are the routes somebody has laid out through the degree, term by
term. A card says what it is called, the entry year it was written for, how long
it runs, and — at the foot, so the chips line up across a row whether or not the
card above them says **Auto Apply** — what it is a route through: the main line
or a branch off it, the concentrations it covers, and the term it starts in.

Business has three, because the planners' student is standing in one of them:
four lines of his plan say "Added by Pathway", and the Finance branch is the one
that put them there. One pathway per program auto-applies, because two that both
apply themselves is two plans. Most programs have none and say so.

## What is not built

**Create New**, the sort control, **Edit**, **Try on a student** and the
**Degree Requirements** link are drawn and inert, as the named-but-inert
controls on Students are: how many ways in there are is the information, and
what is behind any one of them is a different screen.
