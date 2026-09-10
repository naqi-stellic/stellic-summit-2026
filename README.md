# stellic-summit-2026

Prototypes for Stellic Summit 2026, built from Figma on a shadcn/ui foundation.
One app, one shared design system, a prototype per surface.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # tsc -b && vite build
```

The dev server watches by polling (`server.watch.usePolling` in
`vite.config.ts`). macOS does not deliver file-system events for this project
path, so without it the watcher never fires and Vite quietly serves stale
modules — edits appear to do nothing no matter how hard you reload.

## Prototypes

| Prototype | Figma | Entry |
| --- | --- | --- |
| [Plan Generator](#plan-generator) — Plan Your Path | [`209:35392`](https://www.figma.com/design/6BmYq3FqAnCpTZwzZ5DFcH/Plan-Generator?node-id=209-35392) | `src/pages/plan-your-path.tsx` |

### Adding one

A prototype is a page under `src/pages/`, its data under `src/data/`, and any
components only it needs under `src/components/stellic/`. Everything in
[Shared foundation](#shared-foundation) it gets for free — tokens, the app
shell, the icon set, the retuned shadcn primitives.

Once a second prototype lands it is probably worth folding each one into its own
`src/prototypes/<name>/` directory and routing between them. Not done yet: with
one prototype it would be churn, and the second will say more about where the
seam belongs than guessing now does.

---

# Shared foundation

## Stack

Vite · React 19 · TypeScript · Tailwind v4 · shadcn/ui (Radix).

Tailwind v4 is CSS-first — there is no `tailwind.config.js`. Tokens live in
`@theme` inside `src/index.css`.

## Layout

```
src/index.css                 design tokens + Tailwind theme        shared
src/components/ui/*           shadcn primitives (owned, editable)   shared
src/components/layout/*       app chrome (shell, sidebar, top bar)  shared
src/components/icon.tsx       Material + Stellic icon set           shared
src/lib/cn.ts                 class merger (see below)              shared
public/brand/                 brand art exported from Figma         shared

src/components/stellic/*      components with no shadcn equivalent  per prototype
src/data/*                    prototype data                        per prototype
src/pages/*.tsx               one file per page                     per prototype

reference/                    pixel-verified static HTML baseline
```

## Design system

`src/index.css` mirrors the Figma variable collections one-to-one and then maps
them onto shadcn's semantic layer. The Figma file already names things the
shadcn way — `base/foreground`, `base/input`, `base/ring`,
`base/primary-selected` — so the mapping is direct, and shadcn primitives pick
up Stellic styling without being forked.

The palette is also exposed as utilities (`bg-gray-100`, `text-warning-50`), and
each Figma text style is one `text-*` utility carrying size, leading and
tracking together (`text-h300`, `text-body-md`, `text-label-md`, …). Weight
stays separate, so: `text-body-md font-semibold`.

### Adding shadcn components

```bash
npx shadcn@latest add <component>
```

Components land in `src/components/ui/` and are yours to edit. `button`,
`badge` and `alert` have already been retuned to the Figma spec — Button gained
a `selected` prop for segmented controls and an `aria-pressed` toggled state,
Badge swapped the pill radius for 4px and carries the Stellic status pairs,
Alert became a flex banner.

### Two things to know

**Figma strokes render inside the frame.** A Figma box with 16px padding and a
1px stroke measures 16px from its outer edge to its content; a CSS border adds
to that. So bordered containers use `px-[15px]`, `p-[23px]`, `py-px` — the
Figma value minus the border. Skip it and every bordered box runs 2px tall,
compounding down a list.

**`cn` needs to know our type scale.** Because the type utilities live in the
`--text-*` namespace, they collide with text colours during class merging:
`cn("text-body-md", "text-gray-80")` silently drops the font size. `src/lib/cn.ts`
registers the scale as a font-size group to prevent that, and the bare `cn`
specifier is aliased to it (`vite.config.ts` + `tsconfig`) so CLI-added
components get the fix without being edited. **Add any new `--text-*` token to
that list.**

## App shell

`AppShell` owns the viewport: `h-screen overflow-hidden`, so the sidebar and top
bar stay put and each content column scrolls on its own. Pass a `panel` and the
content area becomes a resizable two-column split.

## Icons

Material Design icons, plus Stellic's own set for the glyphs Material does not
cover, in `src/components/icon.tsx`:

```tsx
<Icon name="check-circle" size={16} className="text-success-100" />
```

Sizes are explicit rather than inherited, because the design uses several sizes
of the same glyph. The Figma file mixes Material's Filled and Outlined sets, so
each entry carries the variant the design actually uses, verified glyph by
glyph against the Figma exports. `s-` prefixed names (home, check, navigation,
arrow-down-fill, notification, help, search, menu-collapse, close) are Stellic's
own and keep their native viewBox.

---

# Plan Generator

A term-by-term degree planner. `src/pages/plan-your-path.tsx`, with the plan
model and its moves in `src/data/plan.ts`.

## Drag and drop

Planned courses can be picked up and dropped into any other planned term
(`@dnd-kit`). Registered terms are locked — `Term.locked` — so their courses
have no handle and can't be moved, and nothing can be dropped into them. Hovering
a movable course reveals a × that removes it.

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

"Generate plan" toggles a side-by-side wizard (`src/components/stellic/generate-plan-panel.tsx`).
The split uses shadcn's `resizable` (react-resizable-panels), and the drag handle
*is* the 4px rail the design already draws between the two columns rather than an
extra divider. Sizes are pixels in v4, so they are the design's own numbers: the
panel opens at 434px, clamps between 340 and 720, and the planner keeps 520px.

The panel group is always mounted. Swapping the wrapper when the panel opens
would remount the whole planner and throw away its scroll position and drag
state.

## Responsive

The planner reflows to *its own* width, not the viewport's — the panel opening
matters as much as the window shrinking — so it uses container queries rather
than media queries. `main` is the `@container`; term cards sit side by side above
`@3xl` (768px) and stack below it. The wizard is its own container too, so its
label/value rows stack once the user drags the panel under 320px.

The sidebar stays a fixed 240px at every width; collapsing it is not wired up yet.

## Fidelity

The page is diffed against a 1:1 export of the Figma frame at 1920×2184. Every
structural landmark — card borders, row borders, section offsets, the timeline
rail — lands on the same pixel; the residual ~0.8% differing pixels are text
antialiasing between Figma's renderer and Chrome's.

`reference/index.html` is the original static build, kept as the baseline the
React app was verified against. It has no dependencies — open it directly.

Deliberate departures from the frame: the sidebar's help block is pinned to the
bottom of the viewport (in Figma the nav column overruns the artboard, so it
falls below the fold); the 4px scroll track on the right edge doubles as the
resize handle; and the FAB keeps a 40px right margin in both states rather than
shifting 10px when the panel opens.
