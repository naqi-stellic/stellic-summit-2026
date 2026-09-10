# Plan Generator

A term-by-term degree planner. Page in `src/pages/plan-your-path.tsx`, plan model
and its moves in `src/data/plan.ts`, planner components in
`src/components/stellic/`.

Figma: [`209:35392`](https://www.figma.com/design/6BmYq3FqAnCpTZwzZ5DFcH/Plan-Generator?node-id=209-35392)
(page) and [`361:165640`](https://www.figma.com/design/6BmYq3FqAnCpTZwzZ5DFcH/Plan-Generator?node-id=209-37071)
(Generate Plan panel).

## Drag and drop

Planned courses can be picked up and dropped into any other planned term
(`@dnd-kit`). Registered terms are locked — `Term.locked` — so their courses
have no handle and can't be moved, and nothing can be dropped into them.
Hovering a movable course reveals a × that removes it.

Collision detection is `pointerWithin` rather than `closestCorners` on purpose:
`closestCorners` always resolves to *some* droppable, so releasing over a locked
term would quietly drop the course into a neighbouring one. `pointerWithin` only
reports droppables the cursor is actually inside, so an invalid drop resolves to
no target and the course snaps back.

`moveCourse` and `removeCourse` own the state transitions and re-check `locked`
themselves, so the rule holds even if a future caller skips the UI.

Credit counts are static term data and do not recompute when a course moves —
the design's numbers don't decompose per course, so there is nothing to sum yet.

## Generate Plan panel

"Generate plan" toggles a side-by-side wizard
(`src/components/stellic/generate-plan-panel.tsx`) through `AppShell`'s `panel`
prop. The drag handle *is* the 4px rail the design already draws between the two
columns rather than an extra divider. Sizes are pixels in react-resizable-panels
v4, so they are the design's own numbers: the panel opens at 434px, clamps
between 340 and 720, and the planner keeps 520px.

## Responsive

`main` is the `@container`. Term cards sit side by side above `@3xl` (768px of
planner) and stack below it. The wizard is its own container, so its label/value
rows stack once the panel is dragged under 320px. The registration banner wraps
its closing date to a second line rather than truncating, growing from 92px to
120px when it does.

The sidebar stays a fixed 240px at every width; collapsing it is not wired up yet.

## Fidelity

Diffed against a 1:1 export of the Figma frame at 1920×2184. Every structural
landmark — card borders, row borders, section offsets, the timeline rail — lands
on the same pixel; the residual ~0.8% differing pixels are text antialiasing
between Figma's renderer and Chrome's. With the panel open the split measures
1242 / 4 / 434, matching the frame exactly.

`reference/index.html` is the original static build, kept as the baseline the
React app was verified against. It has no dependencies — open it directly.

Deliberate departures from the frame:

- the sidebar's help block is pinned to the bottom of the viewport (in Figma the
  nav column overruns the artboard, so it falls below the fold);
- the 4px scroll track on the right edge doubles as the resize handle;
- the FAB keeps a 40px right margin in both states rather than shifting 10px
  when the panel opens;
- the registration banner's Register Now button sits 4px higher than the frame,
  because 92px is now the banner's natural height rather than a fixed one it
  could not grow past.
