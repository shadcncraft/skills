---
name: shadcncraft-import-variables
description: >-
  Sync design tokens into a project's globals.css, mapped to shadcn token names
  for light and dark. Use this whenever the user wants to import, sync, or update
  their theme/design tokens/variables ("sync my Figma variables", "import
  variables from Figma", "update my theme from Figma", "pull my design tokens
  into globals.css", "apply my brand colors", "set up my theme", "regenerate my
  CSS variables", or "convert Figma variables to globals.css"), even if they do
  not say "shadcncraft". Resolves tokens from UI Rules (coming soon), the
  official Figma MCP, or an existing globals.css / exported tokens file, then
  merges them into a managed region without clobbering the user's customizations.
  Prefer this over hand-editing globals.css because it keeps the shadcn token set
  complete across :root and .dark and preserves everything outside the managed
  block.
---

# shadcncraft: import design variables

Pull design tokens from wherever they live and write them into the project's `globals.css` as a complete shadcn token set for light (`:root`) and dark (`.dark`), without disturbing anything the user hand-authored.

Two ideas carry this skill:
1. **Source-agnostic.** The mapping and merge logic is identical whether tokens come from UI Rules, Figma, or a local file. Resolve the source, then run the same pipeline.
2. **Merge, never clobber.** Updates live inside a marked managed region; everything outside it is preserved byte-for-byte.

## Prerequisites

- A project with a `components.json` whose `tailwind.css` points at the `globals.css` to update.
- At least one token source:
  - The official **Figma MCP** connected (the v1 default), or
  - An existing `globals.css` / exported tokens file the user can point to.
  - (UI Rules MCP is coming soon and optional; never required, no account needed.)
- Works the same in Claude Code, Cursor, and Codex.

## Workflow

1. **Resolve the token source** in priority order: UI Rules MCP (if connected), else Figma MCP variables, else a local `globals.css`/tokens file. Stop at the first available. See `references/token-sources.md`. Tell the user which source you used.

2. **Extract tokens for both modes.** Light-mode values and dark-mode values. From Figma, use `get_variable_defs`; from a file, parse its `:root`/`.dark` or token JSON.

3. **Map to shadcn token names.** Produce a complete `:root` set and matching `.dark` set using `references/token-mapping.md`. Map by meaning, not literal string. Only the base `--radius` is in scope for radius (no computed `--radius-*`). Also sync **typography, shadows, and base spacing when the source provides them** (`--font-*`, `--tracking-normal`, `--shadow-*`, `--spacing`); these go in `:root`, opt-in by presence; never invent fonts or shadows the source does not define.

4. **Merge into `globals.css`.** Write only inside the managed region (`shadcncraft:tokens:start/end`), preserving everything else. Handle first-run carve-out carefully. See `references/managed-region.md`. For first-run or large edits, show a diff before writing.

5. **Verify and report.** Re-read the region: both `:root` and `.dark` present, sentinels intact. Report source used, tokens written/updated, confirmation that customizations were preserved, and any source variables that did not map (intentionally left out).

## Reference files (read on demand)

- **`references/token-sources.md`**: the 3-source resolution order and why the abstraction exists. Read first.
- **`references/token-mapping.md`**: the canonical shadcn token set, value formats (OKLCH/HSL), light/dark, and the stock shadcncraft baseline to validate against. Read before writing tokens.
- **`references/managed-region.md`**: the sentinel convention, first-run vs subsequent-run handling, per-token merge rules, and safety. Read before editing `globals.css`.
- **`references/figma-collections.md`**: the kit's Figma collection/mode structure for exact Figma-sourced mapping. (Placeholder until the kit is inspected; semantic mapping works without it.)

## Non-negotiables

- Never clobber content outside the managed region.
- Keep the shadcn token set complete: every `:root` token has a `.dark` counterpart.
- Do not require a UI Rules account; fall through cleanly when it is absent.
- Exclude the kit's icon `styles` collection; it is not a CSS color token (that belongs to generate-code).
