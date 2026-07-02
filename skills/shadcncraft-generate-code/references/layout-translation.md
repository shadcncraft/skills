# Layout translation

Figma describes layout with auto layout, constraints, and resizing. React/Tailwind describes it with flex/grid and responsive prefixes. This file is the translation table, plus the rules for responsiveness and for choosing flex vs grid.

## Auto layout to flex

A Figma auto-layout frame is a flex container. Translate directly:

| Figma auto layout | Tailwind |
| --- | --- |
| Direction: Horizontal | `flex` (default row) |
| Direction: Vertical | `flex flex-col` |
| Gap (item spacing) | `gap-<n>` (round to nearest token, see `token-discipline.md`) |
| Padding | `p-<n>` / `px-` / `py-` (token) |
| Align: top/center/bottom | `items-start` / `items-center` / `items-end` |
| Distribute: packed | default |
| Distribute: space-between | `justify-between` |
| Distribute: center | `justify-center` |
| Wrap on | `flex-wrap` |
| Fill container (grow) | `flex-1` or `grow` |
| Hug contents | default (no width) |
| Fixed width | a token width if it maps; otherwise a sensible responsive width, not an arbitrary px |

House style from the gold-standard blocks: `flex flex-col gap-5 p-5 lg:gap-9 lg:p-9`. Prefer `gap-*` over margins for spacing between siblings.

## When to use grid instead

Use `grid` when the design is a true two-dimensional layout: card galleries, pricing tables, feature grids, dashboards with aligned columns. Signs in Figma: a frame of equal-width repeated children that should reflow into columns, or content that must align across both axes.

```tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
```

Use flex for one-dimensional rows/stacks (toolbars, list items, form rows, headers).

## Constraints and responsive behavior

Figma constraints and the kit's breakpoints translate to Tailwind responsive prefixes. shadcncraft is mobile-first, so author the mobile layout as the base and layer larger breakpoints on top:

| Intent | Pattern |
| --- | --- |
| Tighter spacing on mobile, roomier on desktop | `gap-5 p-5 lg:gap-9 lg:p-9` |
| Stack on mobile, row on desktop | `flex flex-col md:flex-row` |
| 1 column to N columns | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| Hide on mobile | `hidden md:block` |
| Constrain max width / center | `mx-auto max-w-screen-lg` (or the container the design implies) |

Default breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536. If a Figma file only provides desktop and mobile frames, infer the `md`/`lg` switch point from the two; do not invent intermediate breakpoints without evidence.

## Per-style design language

The selected shadcncraft style (Vega, Nova, Maia, Mira, Lyra, Luma, Sera) changes the surface treatment (radius, density, rings, shadows), not the layout skeleton. When generating, apply the active style's idiom to surfaces. Quick cheat sheet (full detail in the repo's `docs/REGISTRY-STYLES.md`):

- **Vega**: clean neutral, mid density, `ring-1 ring-foreground/10` "second skin".
- **Nova**: denser, recessed footers (`bg-muted/50 border-t`).
- **Maia**: pillowy: `rounded-4xl`, `shadow-2xl`, tinted fills.
- **Mira**: compact: `text-xs/relaxed`, `ring-2 ring-ring/30`.
- **Lyra**: brutalist: `rounded-none`, hard `ring-1` focus.
- **Luma**: glassy: borderless `bg-input/50`, heavy shadows.
- **Sera**: editorial: uppercase + tracking, underlined inputs, side-rail alerts.

If you do not know the active style, match what already exists in the project's components rather than guessing, and note the assumption.

## Reuse beats regeneration

Repeating the rule from `component-mapping.md` because it is also a layout rule: if the frame matches a registry block (by data-slot/name in `registry-index.json`), install it instead of translating its layout by hand. The installed block already encodes the responsive behavior correctly. Only translate layout from scratch for genuinely novel compositions.
