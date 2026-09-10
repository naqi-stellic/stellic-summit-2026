# plan-generator-summit

Prototype of the Stellic Plan Generator, built page by page from Figma on a
shadcn/ui foundation.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # tsc -b && vite build
```

## Stack

Vite · React 19 · TypeScript · Tailwind v4 · shadcn/ui (Radix).

Tailwind v4 is CSS-first — there is no `tailwind.config.js`. Tokens live in
`@theme` inside `src/index.css`.

## Layout

```
src/index.css                 design tokens + Tailwind theme
src/components/ui/*           shadcn primitives (owned, editable)
src/components/stellic/*      Stellic components with no shadcn equivalent
src/components/layout/*       app chrome (shell, sidebar, top bar)
src/components/icon.tsx       Material + Stellic icon set
src/data/plan.ts              page data
src/pages/*.tsx               one file per page
src/lib/cn.ts                 class merger (see below)
public/brand/                 brand art exported from Figma
reference/                    the pixel-verified static HTML baseline
```

## Pages

| Page | Figma node | File |
| --- | --- | --- |
| Plan Your Path | [`209:35392`](https://www.figma.com/design/6BmYq3FqAnCpTZwzZ5DFcH/Plan-Generator?node-id=209-35392) | `src/pages/plan-your-path.tsx` |

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
a `selected` prop for segmented controls, Badge swapped the pill radius for 4px
and carries the Stellic status pairs, Alert became a flex banner.

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
arrow-down-fill, notification, help, search, menu-collapse) are Stellic's own
and keep their native viewBox.

## Fidelity

The page is diffed against a 1:1 export of the Figma frame at 1920×2184. Every
structural landmark — card borders, row borders, section offsets, the timeline
rail — lands on the same pixel; the residual ~0.8% differing pixels are text
antialiasing between Figma's renderer and Chrome's.

`reference/index.html` is the original static build, kept as the baseline the
React app was verified against. It has no dependencies — open it directly.

Two deliberate departures from the frame: the sidebar's help block is pinned to
the bottom of the viewport (in Figma the nav column overruns the artboard, so it
falls below the fold), and the 4px scroll track on the right edge is decorative.
