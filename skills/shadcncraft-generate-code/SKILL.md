---
name: shadcncraft-generate-code
description: >-
  Convert a selected shadcncraft Figma frame, component, or full page into
  production React + shadcn/ui code via the official Figma MCP. Use this
  whenever the user wants to turn a Figma design into code, implement a frame,
  "generate code from this design", "convert this Figma component", "build this
  screen from Figma", "make this mockup real", or ship a shadcncraft kit element
  as React, even if they do not say "shadcncraft" or "shadcn" explicitly. Also
  use when a user pastes a figma.com link or node ID and asks for the React/JSX,
  or asks to scaffold a page/section/component that exists in their Figma file.
  Prefer this skill over generic design-to-code because it reuses the matching
  shadcncraft registry block, keeps output on the project's design tokens, and
  emits icons from the project's configured library.
---

# shadcncraft: generate code from Figma

Turn a shadcncraft Figma node into React + shadcn/ui code that drops into the project clean, on the project's tokens, icons, and conventions. The headline idea: **the kit and the registry are the same library**, so most frames already exist as a hand-tuned registry block. Reuse beats regeneration.

## Prerequisites

- The **official Figma MCP** is connected (tools like `get_design_context`, `get_screenshot`, `get_metadata`). If it is not, ask the user to connect it before proceeding.
- This is a **Pro React or Pro Figma + React** capability (the in-editor twin of the Figma plugin's generate-code, which carries the same restriction). It reuses the shadcncraft React registry, and those blocks are served only to a valid license key from either React-shipping product, so a `SHADCNCRAFT_LICENSE_KEY` is required to get real output. See the license gate in step 1.
- The project is set up for shadcncraft: `components.json` with the `@shadcncraft` registry, a license key for pro blocks, and fonts wired up. If it is an empty or plain project, set this up first. See `references/project-setup.md`. Skipping it is the main reason output looks unstyled (serif fonts, wrong colors).
- Works the same in Claude Code, Cursor, and Codex; instructions are tool-agnostic.

## Workflow

1. **License gate (check first, fail fast).** generate-code is a **Pro React or Pro Figma + React** feature: it installs shadcncraft React pro blocks, and the registry serves those only to a valid license key from either React-shipping product. Before doing any work, check for a `SHADCNCRAFT_LICENSE_KEY` in the project's environment. If it is missing, **stop and tell the user this**, in a friendly way: generate-code requires a Pro React or Pro Figma + React license; they can get or upgrade at https://shadcncraft.com/pricing (existing customers: https://shadcncraft.com/upgrade), then set `SHADCNCRAFT_LICENSE_KEY` and re-run. Do not push ahead and silently produce a generic, un-themed approximation as a "free" fallback, which misrepresents the kit. (Token-only work with no pro blocks is `shadcncraft-import-variables`, which is free for everyone.)

2. **Preflight the project.** Generated code only looks right if the project is set up for shadcncraft: the `@shadcncraft` registry configured, a license key for pro blocks, and **fonts wired up** (missing fonts is why output comes out serif). If any of that is missing, set it up first. See `references/project-setup.md`. Skipping this is the number-one reason a result looks nothing like the design.

3. **Get the node.** From the user's selection or pasted link, get the node ID and a screenshot. Use `get_metadata` for the node ID (`12345-67890` form) and `get_screenshot` to see it. Use `get_design_context` for structure when you need it.

4. **Whole page?** If the selection is a full page (its direct children are several `… - Pro <Bundle> Block` instances), do **not** treat it as one component. Resolve every section to its registry block, batch-install them, then for each section **copy the block into a page-scoped file and adapt the copy to the frame**: real copy and real images via `get_design_context` (each `<img>` comes back as one flattened asset URL, and `download_assets` returns sub-fills for composed panels, not the panel image), and the layout deltas the frame shows (`hidden="true"` parts removed, restyled surfaces), before composing. Don't edit the installed block in place. The metadata layer names are component _defaults_, not the instance's real text, and installing a block ships its default stock image, not the design's, so blocks left as-installed read "Acme Inc." with the kit's generic art and the page looks nothing like the frame. See `references/full-page-frames.md`.

5. **Otherwise, reuse before you generate.** Resolve the single frame to a registry item by its `data-slot` value or frame name in `references/registry-index.json` (mind the `-1` variant suffix; node IDs are NOT a reliable key, see `component-mapping.md`). If it matches, install it instead of writing JSX:
   ```
   npx shadcn@latest add @shadcncraft/<name>
   ```
   If the name maps to several variants, disambiguate by screenshot + title. This is rule 0; do not skip it. Write the command in the project's package manager (pnpm/yarn/bun/npm), and for a `pro-*` bundle item remind the user to set `SHADCNCRAFT_LICENSE_KEY` (see `component-mapping.md`). Then, if the frame differs from the block (copy, images, or layout, almost always for a real design), copy it into a page-scoped file and adapt the copy to the frame rather than editing the installed block in place.

6. **Read `components.json`** for `style`, `iconLibrary`, and `aliases`. These drive everything downstream.

7. **Generate (only when there is no registry match).** Compose from shadcn/ui primitives and shadcncraft components, following the reference files below. Do not hand-roll what a primitive already provides.

8. **Self-review and return.** Run the checklist in `references/output-conventions.md`. Return the file(s) with paths, any add commands for dependencies (in the project's package manager; with the `SHADCNCRAFT_LICENSE_KEY` reminder for pro items), and a short note of assumptions made.

## Reference files: read the one you need, when you need it

Keep this file lean; the detail lives in `references/`. Read these on demand:

- **`references/project-setup.md`**: the preflight: configure the `@shadcncraft` registry, the license key, and **fonts/tokens**. Read first if the project is empty/plain or output comes out serif or unstyled.
- **`references/full-page-frames.md`**: a whole-page Figma frame (`… - Pro Block` sections): resolve each section, batch-install, compose in order.
- **`references/component-mapping.md`**: Rule 0 (reuse by name/data-slot), the shadcn + shadcncraft vocabulary, how to resolve a frame to an item, and props/variants mapping. Start here.
- **`references/registry-index.json`**: data: registry item name -> title, description, type, deps, install command. The primary reuse lookup (match frame name / data-slot here).
- **`references/figma-node-hints.json`**: data: Figma node ID -> item name(s). A weak corroborating hint only; not the primary key.
- **`references/token-discipline.md`**: color/radius/spacing/type tokens and the no-hex / no-arbitrary-values rules. Read before writing any className.
- **`references/icon-handling.md`** + **`references/icon-name-map.json`**: read the project's `iconLibrary`, resolve each icon to the right export name, avoid the Hugeicons duplicate-name trap. Read whenever the design has icons.
- **`references/layout-translation.md`**: auto layout -> flex/grid, constraints, responsive, per-style surface idioms.
- **`references/output-conventions.md`**: file placement, imports, naming, accessibility, and the final self-review checklist. Read before returning code.

## Non-negotiables (the rest is judgment)

- This is a Pro React or Pro Figma + React feature. Check for `SHADCNCRAFT_LICENSE_KEY` first; if it's absent, stop and point the user to https://shadcncraft.com/pricing rather than producing a generic, un-themed fallback.
- Preflight the project (registry, license key, **fonts**) before generating. Missing fonts = serif output; no license = pro blocks can't install and you must not silently fall back to a generic lookalike.
- A whole-page frame is a stack of blocks, not one component. Install the sections, don't regenerate the page.
- For a whole-page frame, extract the real copy with `get_design_context` and thread it into every block before composing. Never ship the blocks' default sample content (if "Acme Inc." or "Make Better Decisions" survives, the build is not done).
- Bring over the frame's real **images** too: take their URLs from `get_design_context` (each `<img>` is one flattened asset URL there; use it, not `download_assets`, which returns sub-fills for composed panels like dashboards/showcases), download them into the project, and rewrite each block's image `src`. Installing a block does not import its images. It ships the kit's default stock art, so a default gradient or mockup left where the frame showed a different image is a failed build. Flag any image you can't resolve instead of shipping the default silently.
- Copy each block into a page-scoped file and **adapt the copy to the frame**. Don't edit the installed block in place (it forks the maintained source and collides across pages). Match the frame's **layout**, not just its copy: drop `hidden="true"` parts, apply restyled surfaces/variants/spacing. The block is the starting point; the frame is the spec.
- When a block appears **more than once**, adapt **each instance separately**: pull each instance's own content/images and emit per-instance props or a copy per instance. A block reused with its default content because it repeated is a failed build (count instances, not block names).
- Match the frame's **typography** from `get_design_context`, not the eye: alignment (left vs centered), heading scale + weight, two-tone/coloured headings (use a `<span>`), body width/leading. Mismatched alignment and type scale are the most visible misses.
- **Honour overrides, don't reproduce design debt.** `get_design_context` returns each section already overridden (free to read). Apply meaningful overrides (content, images, hidden layers, variant, alignment, sizing); for ad-hoc style hacks (a section fill flipped to black, off-token colours) map to the nearest token/variant and flag the rest. Never hardcode an off-token value to match a hack.
- Reuse a registry block when the node matches one.
- Tokens only: no hardcoded colors, no arbitrary values.
- Icons from the project's configured library, with real export names.
- Compose shadcn/ui + shadcncraft primitives; respect `components.json` aliases.
