# Output conventions

How generated code should be shaped and placed so it drops into a shadcncraft project without cleanup.

## File placement

Resolve paths from the project's `components.json` `aliases`, never hardcode. Defaults:

| Kind | Alias | Default path |
| --- | --- | --- |
| UI primitives | `ui` | `@/components/ui` -> `src/components/ui` |
| Composed components / blocks | `components` | `@/components` -> `src/components` |
| Hooks | `hooks` | `@/hooks` |
| Utilities | `lib`/`utils` | `@/lib`, `@/lib/utils` |

Place a generated block at a descriptive path, e.g. a generated activity feed at `src/components/activity-feed/activity-feed.tsx`. Match any existing folder convention you see in the project before inventing one.

## Imports

- Use the project's path aliases (`@/components/ui/button`), not relative deep paths.
- One import per primitive from its own module: `import { Button } from "@/components/ui/button";`.
- Group imports: React/third-party first, then `@/` aliases, then local. Mirror the order in the gold-standard files.
- Mark client components with `"use client";` at the top when they use state, effects, or event handlers (as `activity-feed-1` does).

## Naming

- Components: PascalCase function components (`export function ActivityFeed() {}`).
- Files: kebab-case (`activity-feed.tsx`).
- Props types: `ComponentNameProps`, colocated above the component.
- Derive names from the Figma frame's descriptive name; do not use generic names like `Component1`.

## Code style

- TypeScript, function components, named exports (match the registry: `tsx: true`, `rsc: true`).
- Drive interactivity with `useState`/`useMemo` as the gold-standard blocks do; do not hardcode hover/active states that should be behavior.
- Keep sample/placeholder data in a typed `const` below the component, like `activityItemsData` in `activity-feed-1`, so the user can swap it for real data.
- Accessibility basics: real semantic elements (`<button>`, `<nav>`, `<section>`, headings in order), `alt` on images, labels tied to inputs, focus-visible relying on the `ring` token. Use the shadcn primitives; they bring accessible behavior for free, which is another reason to compose them rather than hand-roll.

## Final self-review checklist

Run this before presenting generated code. It is the difference between "looks right" and "drops in clean."

- [ ] **Reuse check:** confirmed the frame's data-slot/name has no match in `registry-index.json` (or deliberately chose to generate a variant).
- [ ] **Tokens only:** no hex, `rgb()`, `oklch()`, or palette colors; no arbitrary `[...]` values; no `--sc-*`/`cn-sc-*` in consumer code. (See `token-discipline.md`.)
- [ ] **Icons:** every icon imported from the project's configured `iconLibrary` with a real export name resolved via `icon-name-map.json`; any guessed name flagged for the user.
- [ ] **Primitives:** composed from shadcn/ui + shadcncraft components, not raw HTML, where a primitive exists.
- [ ] **Paths/aliases:** imports use `components.json` aliases; file placed at a sensible aliased path.
- [ ] **Responsive:** mobile-first base with `md`/`lg` layered, matching the Figma frames provided.
- [ ] **Client boundary:** `"use client";` present iff the component uses state/effects/handlers.
- [ ] **A11y:** semantic elements, ordered headings, labelled controls, `alt` text.
- [ ] **Install commands surfaced:** if the code depends on primitives/components the project may not have, list the add commands, in the project's package manager (pnpm/yarn/bun/npm), not a hardcoded `npx`/`npm`.
- [ ] **License key (pro items):** if you recommend installing a `pro-*` bundle `@shadcncraft` item, reminded the user to set `SHADCNCRAFT_LICENSE_KEY`.

## What to return to the user

1. The generated file(s) with their target paths.
2. Any add commands for dependencies (primitives, shadcncraft components, or a whole block if you installed one instead of generating), written for the **project's package manager** (pnpm/yarn/bun/npm, detect from the lockfile), not a hardcoded `npx`/`npm`.
3. For a **pro-tier** shadcncraft item (`bundle` is `pro-*`), a reminder to set `SHADCNCRAFT_LICENSE_KEY` before installing, or the `@shadcncraft` install fails. (See `component-mapping.md`.)
4. A short note of any assumptions (active style, a guessed icon, an inferred breakpoint) so the user can correct them.
