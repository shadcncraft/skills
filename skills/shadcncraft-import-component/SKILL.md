---
name: shadcncraft-import-component
description: "Build one approved custom Component from a shadcncraft import plan into Figma - a primitive-level piece with its own states that does not exist in the kit, built as a fully bound component set from its React source and measured DOM. Use when someone wants to build a component-level unit from an import-plan.json produced by shadcncraft-import-app, or asks to turn one custom React component into a Figma component in their shadcncraft kit copy. Requires an approved import plan. Blocks, screens, and shells are built by shadcncraft-import-block; official shadcn registry components missing from the kit go through shadcncraft-new-component instead."
---

# shadcncraft: import a component (build)

**Skill version: 4 (2026-09-11, resumable builds and explicit QA targets).** State this version number when you load the skill so the user can verify which build is running.

Build ONE `component`-level unit per invocation from an approved `import-plan.json`: a custom primitive (its own states, not in the kit) as a fully bound Figma component set. Source of truth is the unit's TSX and its rendered DOM, not the shadcn repo - this is custom code with one style's values.

**Recommended model**: Fable, or at minimum Opus 5.

## Intake (ask, never assume)

1. The `import-plan.json` and the unit ID. Verify level is `component`, status is `approved` for a new build or `in-progress` for a resumed build, and dependencies are `built`. For `in-progress`, reconcile the saved build notes with actual Figma nodes before making changes: verify the file and target frame, recorded node/variable/style IDs, completed steps, and existing variants. Reuse verified objects; build only missing work. If records are missing or ambiguous, inspect the target and resolve ownership before creating duplicates or replacing anything. Retain prior approvals and do not request them again unless the proposed change exceeds their scope. A `local-recommended` classification (vendored or third-party artwork) builds as a LOCAL component in the user's file and is not promoted to a shared kit master.
2. Figma frame URL to build in. The fileKey comes ONLY from this URL. Verify the target node resolves before anything else.
3. Confirm the run mode recorded in the plan (customer copy vs Pro kit-maintenance). Record the source Style mode (name and ID) from the app's verified theme configuration and measurements, plus the corresponding Light/Dark Mode IDs. If no kit style matches or the intended style cannot be established, ask before selecting tokens. Keep this selection in the unit's build notes; never compare against an implicit default or inherited mode.
4. Dev server for measurement. In Claude Code, start it yourself (backgrounded); otherwise ask the user to start it and measure through their browser via the Chrome extension.

Light AND dark are always in scope; never ask.

## Phase 0 - Source of truth (the unit's code and DOM)

1. Read the unit's TSX. Parse the className strings into a value table: spacing, radii, colors, typography per part and per state. Tailwind naming maps ~1:1 to kit tokens; arbitrary values (`p-[13px]`) are hygiene flags. Preserve their measured values in the source table; any token substitution needs a separately recorded, approved target.
2. Capture per the unit's `measure` targets, scoped to this unit only: its route(s) at 1440 and 375, light and dark, plus computed styles for the component root and each part, in EVERY state the code defines (hover, focus, disabled, data-states, open/closed - interact to reach them). Headless capture to disk; save under `.shadcncraft/captures/` and fill the unit's `captures` and `measurements` fields.
3. No 8-style table: custom code carries one style's values. Flag anything that looks like it should track style modes.

## Phase 1 - Kit discovery

Verify the three collections (Tailwind, Mode, Style), spot-check the wiring, and identify what to reuse: existing `pro/space/*` and `pro/radius/*` tokens, Mode color tokens, variable-bound text styles, effect styles, and any kit sub-components (toggles, spinners) the component nests. Read conventions from the NEWEST components in the file.

## Phase 2 - Decomposition (checkpoint with the user)

Classify every part from the JSX structure: own component set with variants (the stateful core) / nested sub-component set (small stateful control; in kit-maintenance mode named `Parts / <Name>` on a block page or by its React export name on a component page; never dot-prefix) / folded into the parent (stateless text and layout as TEXT props + booleans) / reuse a kit component / skip (logic-only). State axes go where the web applies them; if the matrix passes ~30 combos, push an axis into a sub-component or trim. Icons in INSTANCE_SWAP slots, never baked in. Write marker strings (source file path, JSX chain) into descriptions.

Present the decomposition and variant matrix to the user before building anything.

## Phase 3 - Variables (approval-gated, reuse first)

- Bind spacing and radii to `pro/space/*` / `pro/radius/*`, colors to Mode tokens, typography to existing bound text styles. Match by resolved VALUE in the recorded source Style mode and both Light/Dark modes, not name. Verify semantic purpose too: equal current values do not make unrelated tokens interchangeable.
- Anything genuinely new - a component var, a custom color composite, a one-off text size - is PROPOSED (name, collection, scopes, per-mode values, why nothing existing fits) and waits for an explicit yes. NEVER create a variable without approval. In customer copies, approved new vars are local to that file.
- When a measured value has no exact suitable token, propose the nearest appropriate pro token with its resolved value and visual impact. Record the source value, proposed target, part/state, Style and Light/Dark modes, reason, and recommended code change in the hygiene report. Apply the substitution only when covered by explicit approval (including an existing approval in the plan). Keep the source table unchanged and save approved substitutions in the build notes as QA targets. Until approved, the difference remains unresolved; do not mark the unit built.

## Phase 4 - Build

Set the unit to `in-progress` before the first mutation. Save created/reused node, variable, and style IDs and completed steps after each logical step. A timed-out call may have applied: inspect Figma before retrying. On resume, preserve verified completed work and prior approvals.

Order: sub-components, then the parent set. Per set: one base variant fully bound, component properties added and linked on the base, clone-per-variant with mutations, `combineAsVariants`, grid layout by axes, `prop=value` names preserving React prop and value casing (for example, `screenSize=sm`). Follow `references/component-recipes.md` for the exact patterns (bound paints, line-box wrapper for control-next-to-text, handle invalidation after `setProperties`, SLOT re-fetch).

Verify with a screenshot, then a light/dark sanity render in a temp frame (delete after) before anything composes on top.

## Phase 5 - QA (every time)

- Value audit: resolve every binding in the recorded source Style mode, once in Light and once in Dark. Follow aliases using each collection's selected mode; detect missing targets and cycles. Compare numeric values and final RGBA channels, not color token identity alone. Check intended semantic token identity separately. Compare against the unchanged Phase 0 table except where an approved substitution defines the target. Record any rounding tolerance. Zero unexplained mismatches; list approved differences explicitly.
- DOM comparison against this run's measurements in every state. Explain measured differences covered by approved substitutions, including their layout effects; investigate all other differences. Verify border and text geometry from measurements rather than applying a universal pixel correction.
- Unbound-paint scan on all non-instance nodes: zero.
- Light and dark renders with the source Style mode and Light/Dark Mode explicitly set on the test wrappers; resize and overfill stress; every boolean combination once.
- Component usability: verify editable text, optional parts, icon swaps, and names. Use the kit naming grammar below in kit-maintenance mode and plain local naming in customer copies, with no dot prefixes.

## Kit naming (Pro v3.5, applied 2026-09-03)

Use **page** as the grouping level, with page-relative component names; verify against the current kit. Pages: one page per group under section dividers `COMPONENTS · shadcn`, `COMPONENTS · Application`, … `BLOCKS · <Category>`, `APPS · <Category>`, `ICONS` (Icon Placeholder, Lucide, Tabler, Hugeicons, Phosphor, Remix), `UTILITY`; plain names, no `↳`; a block page that shares a component page's name ends in ` Blocks` (Sidebar Blocks, Chat Blocks, Progress Blocks). Names: on a component page the root set is the page name (`Button`, `Card`) and parts are the React export name (`CardHeader`, `CardFooter`); on a block page items are `<Name> <n>` (`Footer 4`, `Table 12`, functional names starting at 1 for app blocks: `Rep Leaderboard 1`) with support pieces under `Parts / <Name>`; on an app page screens are `Large`, `Small`, `Cover`, parts `Parts / <Name>`, compositions `Compositions / <Name>` (frames, never components); icons `<Library> Icons / <vendor-name>`; Pro charts on the Chart page as `Pro / <Kind> / <Variant>`. The site URL is derived, not written: section → tier and category, page → group, item → registry slug (`Footer 4` → `footer-4`); use the verified paths recorded in the plan; the historical manifest bundled with shadcncraft-import-app does not contain reconstructed paths. Numbers are identity: never renumber or reuse an existing block's number. Component and part names never use a `.` prefix; a part that supports one block or app stays under `Parts`; promote it to its own component page when two or more groups use it. Variant properties use the React prop name in camelCase (`variant`, `size`, `state`, `orientation`, `screenSize`) with React-verbatim value casing (`default`, `sm`, `lg`, `destructive`; design-only block states `state=default|loading|empty|error`), axis order variant → size → state → orientation → domain-specific.

## Wrap up

Only after QA passes with no unexplained mismatches, update the unit's status to `built` in `import-plan.json`. Save the plan and build notes (node/variable/style IDs, source Style and Light/Dark Mode IDs, completed steps, approvals, substitutions, and QA results) to the session's project. Report what was built, any approved differences, and which units this unblocks. If interrupted or QA is incomplete, retain `in-progress` and record the next step.

## Hard rules

- One unit per invocation. No Figma edits outside this unit's nodes.
- fileKey only from the user's URL.
- NEVER create variables or modify shared masters without explicit approval.
- Drift is flagged with the recommended code change, never silently absorbed.
- Numbers come from the rendered DOM and the source code, never from screenshots alone or memory.