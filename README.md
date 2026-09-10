# stellic-summit-2026

Prototypes for Stellic Summit 2026, built from Figma on a shadcn/ui foundation.
One app, one shared design system, a prototype per surface.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # tsc -b && vite build
```

The dev server watches by polling (`server.watch.usePolling` in
`vite.config.ts`), because fsevents delivery here has proved unreliable — a
stale `fseventsd` stops sending events and Vite then serves the modules it read
at startup, so edits appear to do nothing no matter how hard you reload.
Polling sidesteps the daemon; drop it if `fseventsd` is behaving.

## Prototypes

| Prototype | Figma | Entry | Notes |
| --- | --- | --- | --- |
| Plan Generator | [`209:35392`](https://www.figma.com/design/6BmYq3FqAnCpTZwzZ5DFcH/Plan-Generator?node-id=209-35392) | `src/pages/plan-your-path.tsx` | [docs](docs/plan-generator.md) |

### Adding one

A prototype is a page under `src/pages/`, its data under `src/data/`, and any
components only it needs under `src/components/stellic/`. Everything below it
gets for free — tokens, the app shell, the icon set, the retuned shadcn
primitives. Anything worth writing down about the prototype itself goes in
`docs/<name>.md`, not here.

Once a second prototype lands it is probably worth folding each one into its own
`src/prototypes/<name>/` directory and routing between them. Not done yet: with
one prototype it would be churn, and the second will say more about where the
seam belongs than guessing now does.

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
docs/*.md                     one file per prototype

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
content area becomes a resizable two-column split (shadcn `resizable`). The
panel group stays mounted whether or not a panel is showing — swapping the
wrapper would remount the page and throw away its scroll and interaction state.

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

## Conventions

**Reflow with container queries, not media queries.** A page's usable width
depends on whether a side panel is open as much as on the window, so components
should react to their own container. Mark the scroll area `@container` and use
`@3xl:` and friends.

**Check fidelity by pixel diff, not by eye.** Render the page in headless Chrome
and diff it against a 1:1 export of the Figma frame. That has caught real bugs
here — 2px box drift compounding down a list, silently dropped font-size
classes, a page remounting on panel open — none of which were visible by eye.
