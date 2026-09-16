# Transfer Insights

Opens at `/transfer-insights.html`. Entry: `src/pages/transfer-insights.tsx`.

Staff Home with the switcher taken off and one person left standing in it.

## What differs

One thing, passed to `StaffHome`: `only="jessica"`. That pins the page to a
single persona, which has two consequences and no others.

The **account circle** goes back to being an account circle — the plain grey
disc with initials that every other prototype carries — rather than the "View
as" menu. There is nothing to switch to.

The **greeting** uses the cleared-items tally rather than the "viewing Home with
Jessica's permissions" line. That second line exists to explain why the page
just changed shape under you, and here nothing did.

Everything else is Staff Home's, so a change to either lands in both.

## Why it is worth having twice

Read as seven people, Staff Home argues that one URL can be seven pages, and the
permission model is the argument. That is a long way round if what you want to
show is a transfer office.

Read as Jessica alone the page argues something narrower. Her Home is two
panels and the line between them:

- **Open Items · Transfer** — two credit reviews waiting on her decision, each
  opening onto the rail that says who has already signed and how long it has
  been sitting with her.
- **Insights · Transfers** — three incoming courses her team has articulated by
  hand often enough that a rule would clear the pile, each with the home course
  Stellic suggests mapping it onto.

The same distinction the whole page is built on, with nothing else in the frame
to dilute it: one panel is work somebody sent her, the other is work nobody
sent her.

## Jessica

Defined once, in `src/data/staff-home.ts`, and used by both prototypes:

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
