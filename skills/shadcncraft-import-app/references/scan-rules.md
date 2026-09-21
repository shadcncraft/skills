# Scan and classification rules

## Repo mapping

1. `package.json`: framework, scripts (find the dev command), UI deps (which shadcn era, icon library, animation libs, chart libs). `components.json`: style, aliases, icon library, css file path.
2. Route tree: Next app router (`app/**/page.tsx`, `layout.tsx`, route groups) or the framework's equivalent. Every route = candidate screen. Every `layout.tsx` above routes = candidate shell material.
3. `components/ui/*`: the primitive layer. Everything else under `components/` and feature directories: composition layer.
4. Build the import graph (who imports whom) so every unit's dependencies are explicit and build order is derivable. TS path aliases from tsconfig.

## Classification (one per module)

| Class | Rule |
|---|---|
| Kit primitive instance | `components/ui/<x>` matching a verified live kit component, using the version-aware manifest lookup in SKILL.md (never from memory). ALWAYS diff against stock shadcn first (see modified-primitives policy) |
| Official registry, missing from kit | An official shadcn registry component the target file lacks after scoped live checks and resolving uncertainty with the user. NOT an import unit: route it to `shadcncraft-new-component` (it needs the full 8-style kit treatment) and mark dependent units `blocked` on it |
| Existing Pro piece | Composition that visually and structurally matches a shipped Pro Block/Component. Name the match; the build skill verifies |
| Custom Component | Self-contained primitive-level piece with its own states, not in the kit (e.g. a waveform, a custom control) |
| Custom Block | Composition of primitives/components with layout and content logic (composer, table with toolbar, dialog with form) |
| Shell material | Persistent layout wrapper + its nav content (sidebar, topbar, user menus) |
| Screen | A route's composed view (built by shadcncraft-import-block) |
| Out of scope | Hooks, lib/, stores, server-only logic, API routes, data files |

Granularity guide: a Block is one unit of work a build session can finish. A 23KB composer is one Block; eight small dialogs can be one grouped unit; a page-worth of unrelated pieces is never one unit.

## Default policies (flag, never silently decide)

- **Modified primitives**: diff each `components/ui/*` file against stock shadcn source for the app's shadcn version. Cosmetic deltas (className tweaks, added props that do not change structure) -> classify kit-instance + hygiene flag describing the delta. Structural deltas (new elements, changed anatomy) -> promote to custom Component + flag.
- **Style detection**: compare globals.css radius/spacing/font tokens and primitive class values against the 8 kit style signatures (Nova is the compact default). Record `styleMatch: {style, confidence}`. No confident match -> record candidates and an open question, with no selected style. Affected builds remain blocked until the intended source Style mode is established. Record the selected live Style and Light/Dark Mode IDs and supporting evidence.
- **Icons**: imports from the configured icon library map to the kit's icon system. Any other icon source -> flag.
- **Images/assets**: inventory files referenced from `public/` and imports; plan lists them per unit for placement as fills. Never regenerated or redrawn.
- **Fonts**: any family outside the kit's -> hygiene flag (font must be available in Figma).
- **Third-party UI** (charts, editors, maps, canvas): out-of-scope record with a proposed labeled placeholder strategy. Record source sizing hints and future measurement targets, not measured dimensions. The owning build unit needs explicit acceptance of the placeholder strategy before completion; do not create an executable dependency on an out-of-scope record.
- **Third-party or vendored artwork** (brand marks, licensed icon sets, vendored canvas/animation code): retain as a local-use proposal rather than a shared-master proposal. Classify `local-recommended`, record the source and any known constraints, and leave the owner's decision explicit in the plan.
- **Blocked**: units needing kit pieces that do not exist yet (App Shell before it ships, a missing variant on an existing set) get status `blocked` + `blockedOn` describing exactly what unblocks them.
- **Hard-coded values / non-pro spacing or radii** in custom layers: hygiene entry with the exact recommended change to `pro/space/*` / `pro/radius/*` equivalents. Keep original source values. Propose an appropriate token with original/target values, part/state/property, mode selections, reason, visual impact, and recommended code change. Store the proposal as a substitution with pending approval. Only explicit approval of that exact scope permits the build skill to apply it; plan approval alone is insufficient.

## Repo repair

Do not repair the repo, install dependencies, or start a dev server during planning. Record missing source or unresolved imports as limitations/open questions. Continue source reads where possible; leave runtime setup and measurements to the approved build phase.

## Shell detection

Shell = a layout component that persists across sibling routes AND contains navigation chrome (sidebar and/or topbar). Marketing/landing repos typically have none: their routes are shell-less screens. Record which routes sit inside which shell.

## Token sync mechanics

- Parse `:root` and `.dark` custom properties from the css file named in components.json.
- Resolve tokens in the explicitly selected source Style mode and both Light/Dark modes. Follow each alias using its collection's selected mode; detect missing targets and cycles. Compare final numeric values and RGBA channels after color-space conversion, checking semantic identity separately. Record a concrete tolerance and units; do not use an undefined percentage comparison. Unresolved style/mapping yields `unverified`, not `in-sync`.
- Tokens in code but not in Figma, in Figma but not in code, and value mismatches are three distinct drift types; each gets its own hygiene entry and recommendation. Figma is the source of truth.

## Measurement targets (recorded, not measured)

No rendering at plan time. Per unit, record: the route(s) that render it, the root selector or component boundary, and states worth capturing (open dialogs, expanded menus). The build skill measures at build time. If a route needs auth or data to render: note the app's demo/mock mechanism if present; otherwise put it in open questions. Real credentials are never used at any phase.
