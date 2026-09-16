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

`/` is a landing page with a link to each, grouped by the product it belongs to;
they open in their own tab.

**Team Plan**

| Prototype | Opens at | Figma | Entry | Notes |
| --- | --- | --- | --- | --- |
| Plan Generator | `/generator.html` | [`209:35392`](https://www.figma.com/design/6BmYq3FqAnCpTZwzZ5DFcH/Plan-Generator?node-id=209-35392) | `src/pages/plan-your-path.tsx` | [docs](docs/plan-generator.md) |
| Planner | `/planner.html` | same frames, minus the generators | `src/pages/planner.tsx` | [docs](docs/planner.md) |

**Team Progress**

| Prototype | Opens at | Figma | Entry | Notes |
| --- | --- | --- | --- | --- |
| Advanced What-If | `/advanced-what-if.html` | [`2274:20653`](https://www.figma.com/design/prhu0x6AaQF2AVtLBFoDq3/Audit-Profile-Planner?node-id=2274-20653) | `src/pages/advanced-what-if.tsx` | [docs](docs/advanced-what-if.md) |
| Proactive Compliance | `/compliance.html` | from a static mock, not a frame | `src/pages/compliance.tsx` | [docs](docs/compliance.md) |

The two products share the shell, the tokens and the icon set and nothing else.
Team Plan's two prototypes share their data and their components; Team
Progress' two share the student, the profile cards and the audit tree — the
compliance screen is the what-if's page with one more tab on it.

### Adding one

A prototype is a page under `src/pages/`, its data under `src/data/`, and any
components only it needs under `src/components/stellic/`. Everything below it
gets for free — tokens, the app shell, the icon set, the retuned shadcn
primitives. Anything worth writing down about the prototype itself goes in
`docs/<name>.md`, not here.

Each prototype is its own page in the Vite sense: a `<name>.html` at the root
with a `src/main-<name>.tsx` beside it, both listed in `build.rollupOptions.input`,
and a line on the landing page.
That is what gives each one its own link, in the dev server and in `dist` alike,
with no router and no shared shell to fall out of step.

The second one landed as a thin page over the first rather than a copy of it:
`src/pages/planner.tsx` is a dozen lines that hand `PlanYourPath` a different
starting plan and switch its generators off. Where the two are meant to differ,
that file is the seam — it is the one place a change can be made to one
prototype without reaching the other.

A prototype from another product is not that. Advanced What-If shares the shell
and nothing below it, so what it needed from the shell it asked for by prop:
`AppShell` takes `section` (which nav row to stand on) and `assistant` (whether
the assistant floats at all). Adding a case to a shared component beats
branching on which page is calling.

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
