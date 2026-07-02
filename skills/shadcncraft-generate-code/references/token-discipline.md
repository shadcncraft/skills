# Token discipline

Generated code must read like the rest of a shadcncraft project: themeable, dark-mode-correct, and style-swappable. That only works if every color, radius, and space comes from a token, never a literal. Figma will hand you raw hex values and pixel measurements. Your job is to translate them back into the tokens they came from, not to paste them.

## The hard rules

1. **No hardcoded colors.** Never emit `#fff`, `rgb(...)`, `oklch(...)`, or a Tailwind palette color (`bg-zinc-900`, `text-blue-500`) in generated component code. Map to a semantic token.
2. **No arbitrary values.** Never emit `p-[13px]`, `rounded-[10px]`, `gap-[7px]`, `text-[15px]`. If a Figma measurement does not land on a token, round to the nearest token; do not encode the off-grid value.
3. **Dark mode is free when you use tokens.** Because semantic color tokens already have `.dark` overrides in `globals.css`, token-based code is correct in both themes with no extra work. Hardcoded colors break this.

If you cannot express something with a token, that is a signal to re-check the mapping or ask, not a license to drop to arbitrary values.

## Color tokens

Map Figma fills to these semantic tokens (Tailwind utility on the left, CSS var it resolves to on the right). These are defined in the project's `globals.css` for both `:root` and `.dark`.

| Use | Utility examples | Token |
| --- | --- | --- |
| Page background | `bg-background` `text-foreground` | `--background` / `--foreground` |
| Card surface | `bg-card` `text-card-foreground` | `--card` / `--card-foreground` |
| Popover/menu surface | `bg-popover` `text-popover-foreground` | `--popover` |
| Primary action | `bg-primary` `text-primary-foreground` | `--primary` |
| Secondary surface | `bg-secondary` `text-secondary-foreground` | `--secondary` |
| Muted surface/text | `bg-muted` `text-muted-foreground` | `--muted` |
| Accent | `bg-accent` `text-accent-foreground` | `--accent` |
| Destructive | `bg-destructive` `text-destructive` | `--destructive` |
| Borders | `border` `border-border` | `--border` |
| Subtle border | `border-border-subtle` | `--border-subtle` |
| Inputs | `bg-input` `border-input` | `--input` |
| Focus ring | `ring-ring` | `--ring` |
| Sidebar | `bg-sidebar` `text-sidebar-foreground` ... | `--sidebar*` |
| Charts | `fill-chart-1` ... `fill-chart-5` | `--chart-1..5` |

### shadcncraft semantic status colors

The shadcncraft design system adds status colors on top of stock shadcn. Use these for info/success/warning states instead of palette colors:

| Use | Utility | Token |
| --- | --- | --- |
| Info | `bg-info` `text-info-foreground` | `--info` |
| Success | `bg-success` `text-success-foreground` | `--success` |
| Warning | `bg-warning` `text-warning-foreground` | `--warning` |

Opacity modifiers are fine and idiomatic: `bg-muted/50`, `ring-foreground/10`, `border-primary/20`. The per-style design languages lean on these (see `layout-translation.md`).

## Radius tokens

Map Figma corner radii to the radius scale, never to `rounded-[Npx]`:

`rounded-sm` `rounded-md` `rounded-lg` `rounded-xl` `rounded-2xl` `rounded-3xl` `rounded-4xl` (plus `rounded-full` for pills/avatars).

These derive from `--radius` (default `0.625rem`) via `calc()` multipliers, so they scale with the project's chosen roundness. `rounded-lg` equals `--radius` exactly.

## Spacing and typography: stock Tailwind first

For most generated code, use the **stock Tailwind spacing and text scale**; it is what the gold-standard blocks use:

- Spacing: `gap-1 gap-2 gap-3 gap-5 gap-9`, `p-5 lg:p-9`, etc. Round Figma's auto-layout gaps/padding to the nearest stock step.
- Type: `text-sm text-base text-lg text-xl text-2xl ...` with `font-medium`, `tracking-tight`, etc.

Look at `activity-feed-1` for the house style: `flex flex-col gap-5 p-5 lg:gap-9 lg:p-9`, `text-2xl font-medium tracking-tight`.

## When (not) to use shadcncraft `--sc-*` tokens

The registry has an internal token layer (`--sc-space-*`, `--sc-radius*`, `cn-sc-text-*`) that lets one source render differently across the 7 shadcncraft styles. This matters when **authoring registry items**, and is documented in the repo's `docs/REGISTRY-TOKENS.md`.

For **generated app code in a consumer project, do not emit `--sc-*` tokens or `cn-sc-*` markers.** They depend on build-time transformers and per-style scoping that a normal app does not run; they would silently strip. Use stock Tailwind tokens (above). Only reach for `--sc-*` if you are generating code destined for the registry itself and the user says so.

## Self-check

Before returning code, grep your own output:

- Any `#`, `rgb(`, `oklch(`, or palette color name (`-zinc-`, `-blue-`, `-slate-`...) in a className or style? Replace with a semantic token.
- Any `[` inside a className (arbitrary value)? Replace with the nearest token, or justify it explicitly to the user.
- Any `cn-sc-` or `--sc-` in consumer-bound code? Remove it.
