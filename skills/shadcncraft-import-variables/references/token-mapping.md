# Token mapping: source variables to shadcn token names

The target is a shadcn-shaped `globals.css`: a `:root` block (light) and a `.dark` block (dark), each defining the same set of `--token` names with color values. This file is the canonical list of token names to write and how source variables map onto them.

## The managed token set

Write these tokens (and only these, unless the source clearly provides more that the project already uses). Names match stock shadcn plus the shadcncraft design-system additions.

### Core shadcn colors (required)

```
--background        --foreground
--card              --card-foreground
--popover           --popover-foreground
--primary           --primary-foreground
--secondary         --secondary-foreground
--muted             --muted-foreground
--accent            --accent-foreground
--destructive
--border            --input            --ring
```

### Chart + sidebar (include when the source provides them)

```
--chart-1 --chart-2 --chart-3 --chart-4 --chart-5
--sidebar --sidebar-foreground
--sidebar-primary --sidebar-primary-foreground
--sidebar-accent  --sidebar-accent-foreground
--sidebar-border  --sidebar-ring
```

### shadcncraft design-system additions

These extend stock shadcn; preserve them if present and map status colors to them rather than to palette colors:

```
--info    --info-foreground
--success --success-foreground
--warning --warning-foreground
--border-subtle
```

### Radius

```
--radius   (e.g. 0.625rem)
```

The `--radius-sm/md/lg/xl/2xl/...` variants are computed from `--radius` via `calc()` in the project's `@theme` block, so do **not** emit them per-mode. Only set the base `--radius`.

### Extended tokens: typography, shadows, spacing (sync when the source provides them)

Modern shadcn/tweakcn themes carry more than color in `globals.css`. When the source provides these, sync them too. They live in `:root` (mode-independent; do **not** duplicate them into `.dark` unless the source genuinely defines a dark variant, which only shadows sometimes do):

- **Typography:** `--font-sans`, `--font-serif`, `--font-mono` (font-family stacks), and `--tracking-normal` (base letter-spacing). Map a source's "heading/body/mono font" and "letter spacing" here.
- **Base spacing:** `--spacing` (Tailwind v4's base spacing unit, e.g. `0.25rem`). A single value, like `--radius`, not a per-step scale.
- **Shadows:** the shadow scale `--shadow-2xs`, `--shadow-xs`, `--shadow-sm`, `--shadow`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-2xl`. If the source uses the decomposed tweakcn form (`--shadow-color`, `--shadow-opacity`, `--shadow-blur`, `--shadow-spread`, `--shadow-offset-x`, `--shadow-offset-y`), sync those component vars and let the scale derive from them; otherwise sync the resolved box-shadow strings.

These are **opt-in by presence**: only write a token if the source defines it. A bare brand-color export has none of these, and that is fine. Do not invent fonts or shadows. This is the difference that brings parity with (and past) competing token-sync tools, which sync colors/radius/typography/shadows/spacing.

Note on the shadcncraft kit specifically: its Figma variables express spacing/text via the build-time `--sc-*` layer, not as `globals.css` vars (see `figma-collections.md`), so a Figma-sourced kit import will usually only carry colors + radius. Extended tokens mostly come from tweakcn-style theme files or brand token exports.

## Value format

- shadcncraft's stock tokens are authored in **OKLCH** (`oklch(1 0 0)`, `oklch(0.205 0 0)`).
- **Format precedence (this overrides "prefer OKLCH"): match the project's existing convention first.** If the file already stores colors in OKLCH, write OKLCH; if HSL, write HSL, so the file stays internally consistent (this is the same rule as `managed-region.md`, "do not migrate value formats unnecessarily"). Only when the file has no existing color tokens to match, default to OKLCH. The shadcncraft status colors are authored in HSL (`hsl(201, 98%, 32%)`); either format is valid CSS, so convert them to the file's convention rather than mixing formats within a block.
- Alpha is fine: `oklch(1 0 0 / 10%)`, `oklch(0 0 0 / 5%)`.
- Do not wrap values in `hsl(var(--x))` indirection unless the project already uses that older shadcn convention. Modern shadcncraft stores the resolved color directly on the token.

## Light vs dark (the modes)

The source provides two modes (light, dark). Map:

- Light mode values -> the `:root` block.
- Dark mode values -> the `.dark` block.

Every token in `:root` should also appear in `.dark` (shadcn assumes both exist). If the source only defines light, derive sensible dark values or ask the user; do not leave `.dark` partial.

## Reference: a correct shadcncraft `:root` / `.dark` shape

This is the stock shadcncraft baseline (neutral). Use it to validate your output's structure and token set, not to overwrite the user's brand values.

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
  --info: hsl(201, 98%, 32%);
  --info-foreground: hsl(204, 100%, 97%);
  --success: hsl(155, 90%, 24%);
  --success-foreground: hsl(145, 81%, 96%);
  --warning: hsl(22, 92%, 37%);
  --warning-foreground: hsl(45, 100%, 96%);
  --border-subtle: oklch(0 0 0 / 5%);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  /* sidebar + status tokens follow the same pattern */
}
```

## Mapping a source variable to a token name

Source variable names vary (Figma collections, exported JSON). Resolve by meaning, not by exact string:

- A Figma variable named `Background/Default`, `bg`, or `surface` -> `--background`.
- `Primary`, `brand`, `accent/primary` -> `--primary`; its on-color -> `--primary-foreground`.
- `Border`, `stroke/default` -> `--border`; a subtler stroke -> `--border-subtle`.
- Status colors (`info`, `success`, `warning`) -> the shadcncraft status tokens.

The kit's exact variable structure lives in `references/figma-collections.md`. Important shortcut for the shadcncraft kit: its color variables are authored **as shadcn CSS var names** (the Figma variable is literally `var(--primary)`), so mapping is near pass-through: strip the `var(--...)` wrapper to get the token name. That file also lists the kit namespaces to exclude (`icon-library/*`, `pro/space/*`, `text/*`, `font/*`, etc.). When a source variable has no clear shadcn home, do not force it into the managed set; leave it out and note it, rather than mislabeling a token.
