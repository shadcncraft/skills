# shadcncraft kit: Figma variable structure

Captured from the shadcncraft Pro v3.1.1 Preview file (`get_variable_defs`). This documents the kit's variable namespaces so Figma-sourced imports map deterministically. One namespace matters for this skill (colors); the rest are out of scope and listed so you exclude them deliberately.

## The headline: colors are authored AS shadcn CSS variables

The kit's color variables are named with the literal CSS custom-property syntax, e.g. the Figma variable `var(--primary)` resolves to `#171717`. So the Figma-to-`globals.css` color mapping is **near pass-through**: strip the `var(--...)` wrapper to get the token name and write the resolved color as its value.

Observed color variables (light mode values shown; dark mode is the other mode on the same collection, with identical variable names):

| Figma variable | shadcn token | Light value (observed) |
| --- | --- | --- |
| `var(--background)` | `--background` | `#ffffff` |
| `var(--foreground)` | `--foreground` | `#09090b` |
| `var(--primary)` | `--primary` | `#171717` |
| `var(--muted)` | `--muted` | `#f4f4f5` |
| `var(--muted-foreground)` | `--muted-foreground` | `#71717a` |
| `var(--accent)` | `--accent` | `#f5f5f5` |
| `var(--border)` | `--border` | `#e4e4e7` |

The full set follows the managed token list in `token-mapping.md` (card, popover, secondary, destructive, input, ring, sidebar*, chart*, and the shadcncraft status colors info/success/warning + border-subtle). Pull every `var(--*)` variable the kit exposes; map each by stripping the wrapper.

Note: these observed hex values are the light-mode resolution of the stock neutral theme, the same colors the registry stores as OKLCH (`--primary: oklch(0.205 0 0)` is hex `#171717`). Preserve the project's existing value format when writing (see `token-mapping.md`); convert hex<->OKLCH only to stay consistent within a block.

## Modes -> shadcn blocks

The color collection has light and dark modes. Map light mode -> `:root`, dark mode -> `.dark`. `get_variable_defs` returns the resolution for one mode at a time; pull both modes (switch the kit's theme mode, or read the variable's per-mode values) so `.dark` is complete.

## Out of scope: do NOT import these into globals.css

The kit carries several other variable namespaces. They are not shadcn color tokens; importing them into `globals.css` would be wrong:

- **`icon-library/*`** (e.g. `icon-library/lucide: "true"`): the active icon library switch. This belongs to the generate-code skill, not theme tokens. Exclude.
- **`pro/space/*`** (`pro/space/1: 4`, `pro/space/5: 16`, `pro/space/20: 64`, ...) and raw `spacing/*`, `width/*`, `height/*`, `max-width/*`: the shadcncraft spacing scale and layout primitives. These are handled in code via Tailwind + the build-time `--sc-space-*` layer, not via `globals.css` color tokens. Exclude.
- **`pro/radius/*`** (`pro/radius/radius: 10`) and `radius/*`, `rounded-*`: radius scale. Only the **base `--radius`** is in scope for this skill (map `pro/radius/radius` -> `--radius`, e.g. `10` -> `0.625rem`). The `--radius-sm/md/lg/xl/...` variants are computed in `@theme`; do not emit them.
- **`text/*`, `font/*`, and composite font styles** (`text/6xl/size: 60`, `font/family/heading: Geist`, `6xl/leading-none/medium: Font(...)`): typography scale and font families. Out of scope for token import; the project's Tailwind/theme config owns these.

## Still to confirm (minor)

`get_variable_defs` returns resolved variable values, not collection display-names or mode-names. The mapping above does not depend on those, but if you want to label the source precisely, confirm the color collection's name and its light/dark mode names from the Figma desktop Variables panel. Not required for a correct import.
