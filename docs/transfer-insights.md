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
him, and twenty-six things wrong with the audits he can edit. Nothing on it is
Jessica's.

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
comes from, and the body leads with the size of the pile a rule would clear —
"38 pending articulations".

Its second line is the only thing on Home that Stellic is guessing at: it has
matched an incoming course to a home one. So it is the only line that carries
the assistant's mark, and the only one that says **Suggestion** where every
other finding says **Suggested**. Those findings are a fact with a fix; this is
a proposal, and the wording keeps them apart.

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
