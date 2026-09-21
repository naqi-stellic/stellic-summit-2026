# Transfer Insights

Opens at `/transfer-insights.html`. Entry: `src/pages/transfer-insights.tsx`.

Staff Home with the transfer officer standing in it rather than the registrar.

## What differs

Three props on `StaffHome`, and the permission model does everything else — a
change to either prototype lands in both.

`who="jessica"` where Staff Home passes `who="marcus"`. That alone decides both
panels: her tabs, her insights, her rows.

`inert={["appts"]}`. Her appointments are real and the count is hers, so the tab
is drawn — but this prototype is about transfer credit and nothing has been
built behind it. It is not greyed and not disabled, because it is not either of
those things: it is an ordinary unselected tab that happens to have nothing
behind it, so only the pointer and the hover go.

`without={["reports"]}`. Pinned reports are a registrar's habit rather than a
transfer officer's, and they are the one block on Home with nothing to act on.
Off the page, and off the Customize list with it — a switch for something the
page will not draw is a promise it cannot keep.

## Why it is worth having twice

Because the page is not one page. Staff Home is a registrar's morning: publish
requests to approve, exceptions to decide, graduation clearances sitting with
him, and twenty-six things wrong with the audits he can edit. None of that work
is Jessica's, and none of her queue is his — the credit reviews waiting on a
decision are hers alone. The articulations Stellic has noticed are the one
thing they share, because a rule written once takes the work off both desks.

Hers is two panels and the line between them:

- **Open Items · Transfer** — two credit reviews waiting on her decision, each
  opening onto the rail that says who has already signed and how long it has
  been sitting with her.
- **Insights · Transfers** — three incoming courses her team has articulated by
  hand often enough that a rule would clear the pile, each with the home course
  Stellic suggests mapping it onto.

One panel is work somebody sent her; the other is work nobody sent her. That is
the distinction the whole page is built on, with nothing else in the frame to
dilute it.

### The Transfers row

Figma: [`16:13521`](https://www.figma.com/design/gcskEkzwNusd12TOommFW0/Staff-Home?node-id=16-13521).

The one place in either prototype where an insight belongs to no program. The
row is an incoming course, so it leads with that course and the institution it
comes from, and the body is the size of the pile a rule would clear — "38
pending articulations", and nothing else. That number is the whole decision:
whether the rule is worth writing.

Stellic has also matched the incoming course to a home one, but that match is
not on the row. Everything else on Home is a fact with a fix; a match is a
guess, and a guess is only worth anything where somebody can check it and change
it. So it waits in the equivalency form, which opens holding it.

## Create new equivalency

Figma: [`77:16095`](https://www.figma.com/design/gcskEkzwNusd12TOommFW0/Staff-Home?node-id=77-16095).
`src/components/stellic/staff-equivalency.tsx`.

Where **Create rule** goes. The insight says a course keeps being articulated by
hand; this is the rule that stops it. It takes the whole page rather than a
panel — it is the destination the insight was pointing at, not a footnote to it
— and the nav stands on Transfer while it is open.

The form arrives already holding an argument. The incoming course is on the
left, taken from the row. The right-hand column is Stellic's proposals, each a
dashed card with an **Add**, a **Hide**, and the evidence behind the badge:
*"Matched to 31-1200 on 36 of the last 38 transfers from Seneca College, every
one of them approved."* A suggestion that cannot say why it is suggesting is
just an instruction, so every one of them carries its reason.

Adding a suggestion turns it into an ordinary course on the rule: solid border,
a remove ×, the same shape as the incoming course opposite. That is the only
state change on the page, and it is the whole difference between a suggestion
and a default — nothing is on the rule until somebody puts it there.

The row Jessica pressed decides everything the form shows: the institution, the
incoming course, which suggestion leads, and how many students the rule would
catch. Nothing is invented between the two screens.

### Course description

The other half of writing an equivalency is knowing what the incoming course
actually was, and nobody in a registrar's office has Seneca's catalogue. The
slow part of the job is opening a tab, finding a college's site and reading a
paragraph — so **Course description lookup** sends the assistant to read it.

`src/components/stellic/staff-course-details.tsx`. It opens **where the button
was**, in the column the course is in, rather than over the page: what it says
is about that course and is read against it, and a dialog would cover the very
thing it describes. Closing it puts the button back.

Two things keep it honest rather than magical. While it works it says what it is
doing, naming the institution and the code — *"Searching the catalog for
21-1200…"* — rather than turning a spinner at you; five steps, one a second, so
the wait is five seconds and never longer. And when it answers it says where it
read, as source chips under the description, so the answer can be checked
instead of trusted. The line at the foot — *details may contain errors, verify
with the source links* — is the same point, and the thumbs beside it are how a
wrong one gets reported. Only a thumbs down is asked to explain itself; a thumbs
up is already the whole message.

The card fills rather than appears: every word is queued and revealed in order,
so it grows downward at a steady rate and reads as something being written for
you. A conic gradient turns just outside its edge while that is happening and is
gone the moment it stops, so "Stellic is working on this" is a property of the
surface rather than another thing to read. Both stop under
`prefers-reduced-motion`.

One course in the source column, one course read out of the catalogue. The card
describes what is in front of it and nothing else.

### The impact dialog

Save does not save. It opens **Create equivalency rule**, which states the
equivalency in one line and then the thing a form cannot: *38 students will have
articulations created by this rule*, with their usernames a click away. A rule
is not one decision about one student, it is one decision about everybody it
catches, so the count comes before the button.

**Set articulation status** decides what the rule does to them — Pending, New or
Completed. Pending is the default, because a rule going live should not award
credit before anyone has looked at what it swept up.

Creating the rule resolves the insight: the row leaves the Transfers tab for
good rather than going to hidden, because the work is done rather than put off,
and the cleared-items tally moves.

## Jessica

Defined in `src/data/staff-home.ts` beside Marcus, who is the other one:

| | |
| --- | --- |
| Permissions | `articulations`, the `transfer` workflow, appointments |
| Tabs | Appointments, Transfer |
| Insight tabs | Transfers |
| Lands on | Transfer |

Appointments comes first in the tab bar, because the bar is in priority order
and a person's own diary outranks the requests waiting on them. Transfer is
still where she starts, because it is what she opened Home for — that is what
`landsOn` is for, and it is a fact about the person rather than a default the
queue gets to hold.

She has no audit permissions at all, so there is no Audits or Exceptions tab in
either panel, and no program insight is visible to her. The Transfers insight
tab is the only one she gets, and every row in it is catalogue-level.
