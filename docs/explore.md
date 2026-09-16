# Prospective Student Lite

Team Explore's first prototype — "Explore Transfer Credits" on the screen
itself, which is what the institution calls it. Opens at `/explore.html`. Page in
`src/pages/explore.tsx`, data in `src/data/transfer.ts`, chrome in
`src/components/stellic/explore-shell.tsx`, the rest in
`src/components/stellic/transfer-*.tsx`.

Built from
[`2362:4464`](https://www.figma.com/design/8OuDzmowzaVkdMBm0SbQCr/Prostu-Transfer-Experience?node-id=2362-4464)
— the college-credit happy path — in the Prostu Transfer Experience file.

## What it is

A prospective transfer student, before there is any such thing as a student
record. They arrive with a transcript and leave with a number: *14 of your 25
credits transfer*. Nobody here has applied, and the page says so in as many
words — an estimate, not a decision; admissions does the official review.

That is what makes it unlike everything else in this repo. Every other
prototype is somebody signed in to Stellic. This one is a visitor on the
university's own site, so it has **no `AppShell`**: no nav to stand in, no
section title, no assistant. The institution's mark and the name of what they
are doing, a way to ask for help, and one centred card.

The university is **Stellic University**, standing in for the real institution
the Figma file is branded to.

## The flow

| Step | Card asks | Figma |
| --- | --- | --- |
| `kind` | Which kind of credit — college or examination | `2362:4603` |
| `transcript` | Which institution, then how you'll hand it over | `2362:5203`, `2362:5212` |
| — | The OS file picker, which is not ours to draw | `2362:5400` |
| `questions` | Three questions, while the transcript is read | `2362:4707`, `2362:4739`, `2362:4749` |
| `results` | What transferred, what to study, what else to know | `2362:4952` |

Four of the five states are the same white card saying the same heading, "Add
your transcript", with a different question under it — so the card, the heading
and the two-up tile are components rather than four copies, and the flow reads
as one screen changing its mind.

## The screen this exists to show

The fourth one. OCR takes up to a minute and a minute of a spinner is a minute
of nothing, so the design spends it: the questions appear the moment the file
is handed over, and they are answerable while the read runs. Three things
follow from that, and all three are load-bearing:

- **The primary button waits on the transcript, never on the answers.** `See my
  results` unlocks when every transcript hits 100%, whether or not a single
  question was touched. A visitor who only wants their credit count gets their
  credit count.
- **A transcript at 100 is a transcript that is ready.** Progress is the only
  state; there is no second `ready` flag that could disagree with it. That also
  makes a second transcript added mid-read behave correctly for free — one
  timer advances every unread entry, and the button waits for all of them.
- **`+ Add another transcript` opens the same two tiles as the first step**,
  in place, under the transcripts they are being added to. A second way of
  asking the same question would have been a second thing to keep in step.

Reading runs for **10 seconds**, not the 60 the copy promises
(`PROCESSING_MS`). A real pass would use them; a prototype that did would only
ever be watched once. Ten is long enough to answer all three questions before
it finishes, which is the whole point of the screen.

## The results page

Four parts, and the order is the argument: the number first, because it is the
only thing the visitor came for; programs second, because a credit count is
useless without somewhere to spend it; the university's own content last,
because it is the only thing on the page that is not about this person. The
rail holds what they gave us, and the one thing we want them to do with it.

**The verdict is said twice** — once as a sentence, once as a three-segment
bar. The bar is not decoration: it is the only place the three totals are in
proportion to each other, which is the difference between "8 pending" and "8
pending out of 25".

**Only confirmed rows have two sides.** An arrow earns its place when there is
a destination; pending and no-credit rows have nothing on the right, so they
are one line with the transcript's own facts pushed to the end of it. A
no-credit row is greyed whole — the row is the verdict, not a row with a
verdict on it.

**Every recommended program says why it is there.** `Transfers the most
credits`, `Matches interests`, `Most of your credits count` — the badges are
the only place the three questions and the credit count are visibly doing any
work, and a recommendation with no reason beside it is a guess.

The Discover cards are institution content rather than design: the admin panel
in the same Figma file configures all four titles, lines and images. They live
in `public/brand/explore/` and are swapped there, not in code.

## Where this departs from the artboards

Small, deliberate, and each one for a reason:

- **The green segment is 56%, not 75%.** The file draws it at 75% while the
  amber above it ends at 88% — but 14 of 25 credits is 56%, and 88% is where
  14+8 lands. The amber is right, so the bar is computed from the data and the
  green moves.
- **The results column is centred.** The file places it 232px from the left of
  a 1687px frame and 106px from the right. The wizard card on every other
  artboard is centred, so this one is too.
- **`Back` stays on the questions screen.** Two of the four artboards of that
  screen draw it and two do not. It is one screen, so it has one footer.
- **The institution search has a dropdown.** The file cuts from an empty field
  to a filled one. A field you cannot pick from is not a search, so there is a
  list — the plainest one that does the job.
- **The tiles have a hover state.** They are drawn at 80% and nothing else is
  drawn, so hover takes them to full rather than introducing a colour the
  design does not have.
- **Two Discover photographs are cropped.** They carried the real
  institution's marks, which the rename to Stellic University contradicts. The
  crop keeps the photograph and drops the lettering.
- **Manual course entry is drawn but inert.** Typing courses into a table by
  hand is in the master flow, not this one. The tile stays, because leaving it
  out would misreport what the design offers.

## What is not here

The linked section is one path through a much larger flow
([`2362:4462`](https://www.figma.com/design/8OuDzmowzaVkdMBm0SbQCr/Prostu-Transfer-Experience?node-id=2362-4462)).
Not built: the landing and sign-in screen, the examination entry screens, manual
course entry, the emailed summary, the returning-user OTP path, the
post-results editing and re-articulation screens, and the Stellic admin panel
that configures all of it. `edit or add` and `edit` on the rail go back to the
questions screen rather than to the dedicated update screens the master flow
draws for them.

The examination tile is live as far as the flow allows: it skips the
institution question, since an exam board is not one, and produces an `AP
Credits` transcript that reads and completes like any other. That is what puts
two entries in the results rail, as the artboard shows.
