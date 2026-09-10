# plan-generator-summit

Static HTML prototype of the Stellic Plan Generator, built page by page from
Figma. No build step — open `index.html` in a browser.

## Pages

| Page | Figma node | File |
| --- | --- | --- |
| Plan Your Path | [`209:35392`](https://www.figma.com/design/6BmYq3FqAnCpTZwzZ5DFcH/Plan-Generator?node-id=209-35392) | `index.html` |

## Layout

```
index.html                        page markup
assets/css/tokens.css             design tokens + type roles
assets/css/base.css               reset and document ground
assets/css/components.css         reusable components
assets/css/shell.css              app chrome (sidebar, top bar)
assets/css/pages/<page>.css       per-page layout
assets/js/icons.js                SVG icon sprite
assets/img/                       brand art (exported from Figma)
```

Each new page adds one file under `assets/css/pages/` and reuses everything
else. Anything used twice belongs in `components.css`.

## Design system

**Tokens** (`tokens.css`) mirror the Figma variable collections one-to-one:
the `stellic colors` palette, the `base/*` semantic aliases, the type scale,
spacing, radii and elevation. Nothing outside `tokens.css` should contain a raw
hex value or a bare pixel font size.

Type roles are exposed both as classes (`.t-h300`, `.t-body-md`, …) and as the
`font:` shorthands components compose from.

**Components** are BEM-ish: `.btn`, `.btn--tertiary`, `.btn--sm`. The set so far
covers button, badge, status pill, audit icon, input, avatar, alert, audit row,
semester card, credit group, timeline rail, dashed drop slot, and the FAB.

### One thing to know about spacing

Figma paints strokes *inside* a frame, so a Figma box with 16px padding and a
1px stroke measures 16px from its outer edge to its content. A CSS border adds
to that. Every bordered container therefore subtracts the border width back out
of its padding:

```css
padding: calc(var(--space-4) - var(--border-width));
```

Skipping this makes every bordered box 2px taller than the design, and the error
compounds down a list.

## Icons

Material Design icons, plus Stellic's own set for the pieces Material does not
cover. Both live in one injected sprite (`assets/js/icons.js`):

- `#i-*` — Material, 24×24. The Figma file mixes Filled and Outlined, so each
  symbol carries the variant that matches the design.
- `#s-*` — Stellic's own glyphs (home, check, navigation, arrow-down-fill,
  notification, help, search, menu-collapse), traced from the Figma exports and
  keeping their native viewBox.

Usage — the glyph inherits `currentColor`, so colour it on the host element:

```html
<svg class="icon icon--16" aria-hidden="true"><use href="#i-add" /></svg>
```

Sizes are explicit (`--8`, `--12`, `--14`, `--16`, `--20`, `--24`) rather than
inherited, because the design uses several sizes of the same glyph.

## Fidelity

`index.html` was diffed against a 1:1 export of the Figma frame at 1920×2184.
Every structural landmark — card borders, row borders, section offsets, the
timeline rail — lands on the same pixel. The residual ~0.8% differing pixels are
text antialiasing between Figma's renderer and Chrome's.

Two deliberate departures:

- The sidebar's help block is pinned to the bottom of the viewport. In the Figma
  frame the nav column is taller than the artboard, so the block falls below the
  fold; pinning is what the component's `justify-end` actually intends.
- The 4px scroll track on the right edge is decorative, matching the design.
