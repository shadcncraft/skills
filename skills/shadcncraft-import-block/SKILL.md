---
name: shadcncraft-import-block
description: "Build one approved unit from a shadcncraft import plan into Figma - a custom Block as a component, a screen composed from Block instances as Large 1440 and Small 375 frames, or App Shell reconciliation and variant work. Use when someone wants to build or execute units from an import-plan.json produced by shadcncraft-import-app, asks to build a block or screen in Figma from their React code, or wants to compose app screens from already-imported blocks. Requires an approved import plan. Custom primitives at the component level are built by shadcncraft-import-component instead."
---

# shadcncraft: import a block or screen (build)

**Skill version: 5 (2026-09-11, responsive mapping and resumable builds).** State this version number when you load the skill so the user can verify which build is running.

Build ONE unit per invocation from an approved `import-plan.json`. Levels this skill handles: `block`, `screen`, `shell`. A `component` unit goes to `shadcncraft-import-component`; do not build it here.

**Recommended model**: Fable, or at minimum Opus 5.

## Intake (ask, never assume)

1. The `import-plan.json` (from the session's project or provided by the user) and the unit ID to build. Start a new build from `approved`, or resume `in-progress`, with every `dependsOn` unit at `built`. On resume, reconcile saved node/variable/style IDs, completed steps, and approvals with the target file. Reuse verified existing work; resolve ambiguous ownership before creating or replacing objects. Nothing builds from `planned` or with unmet dependencies. For `blocked` or `flagged` units, verify the recorded issue is resolved and restore `approved` (no work started) or `in-progress` (partial work exists) before continuing; retain partial-work IDs and prior approvals. If blocked, record exactly what unblocks it.
2. Figma frame URL to build in. The fileKey comes ONLY from this URL, never from the plan's history or any manifest. Verify the target node resolves (get_metadata) before anything else.
3. Confirm the run mode recorded in the plan (customer copy vs Pro kit-maintenance). Record the source Style mode name/ID from verified app theme configuration and measurements, plus the Light/Dark Mode IDs. If the intended kit style cannot be established, resolve that before selecting tokens. Store these in build notes; never compare values using an implicit default or inherited mode.
4. Dev server for QA. In Claude Code, start it yourself (backgrounded) and note the port; otherwise ask the user to start it and measure through their browser via the Chrome extension.

Light AND dark are always in scope; never ask.

## Prerequisites

Load the `figma-use` guidance before any `use_figma` call. Read `references/block-recipes.md` before building.

**Measure first, then build.** The plan carries no measurements, only each unit's `measure` targets (routes, root selector, states). Before building this unit, capture exactly what it needs and nothing more: screenshots of its route(s) at 1440 and 375, light and dark, plus a computed-style dump for the root and layout-relevant children (rects, paddings, gaps, radii, font sizes, visibility, direction, order, and wrapping) in each listed state at both widths. Save to `.shadcncraft/captures/`, write the paths and numbers into the unit's `captures` and `measurements` fields, and use them as the build and QA target. Never capture routes other units own.

## Build state and QA targets

Set `in-progress` before the first Figma mutation. Save created/reused IDs, completed steps, approvals, responsive mappings, and remaining work after each logical step. A timed-out call may have applied; inspect Figma before retrying.

Keep source measurements unchanged. For each proposed token substitution, record the part/state/property, source Style and Light/Dark modes, original value, target token and resolved value, reason, visual impact, and recommended code change. Apply only substitutions covered by explicit approval, including approval already in the plan. Save these separately in build notes as QA targets. Unapproved substitutions and missing required variants or responsive behavior are blocking issues, not accepted divergences.

## Block unit

1. Map every child in the Block's JSX to a kit set + variant using the plan's `kitMatch` data. Verify each setId resolves to the expected component set in THIS file before instancing. Match the required variant by its property map, preserving React casing; do not depend on display-name formatting or property order. Include every axis or a verified default. Require one unique matching component. A missing or ambiguous match is a blocking issue with a specific proposal, never improvised inline.
2. Build the Block as a COMPONENT with auto-layout mirroring the DOM. Bind everything: spacing, gaps, and paddings to `pro/space/*`; radii to `pro/radius/*`; colors to Mode tokens; typography to existing variable-bound text styles. Match tokens by resolved values in the recorded source Style mode and both Light/Dark modes, checking semantic purpose too. When no suitable exact match exists, use the substitution process above; never silently choose the nearest token.
3. Expose the API the code parameterizes: TEXT props for strings, booleans for optional parts, INSTANCE_SWAP for icons and media, SLOTs where the code takes children. Defaults are the code's real defaults.
4. Write the description: source file path and JSX chain marker strings, plus every accepted divergence.
5. Map the source's responsive behavior at 1440 and 375: direction, order, visibility, wrapping, sizing, and state. Use auto-layout for behavior it can represent; use explicit responsive variants for discrete changes, preserving source prop/value casing. Record which variant and overrides each width requires. Verify both before a Screen depends on this Block.
6. Naming follows the run mode: in kit-maintenance mode the kit naming grammar below (`<Name> <n>` on the group's page, app blocks as functional names starting at 1, support pieces under `Parts / <Name>`); plain local component naming in customer copies.

## Screen unit

1. Produce both frames: in kit-maintenance mode `Large` (1440) and `Small` (375) on the app's page; in customer copies `<Name> - Large` and `<Name> - Small`, stacks of Block instances in the order the route's layout tree dictates.
2. Shell handling: shell-less routes compose as plain stacks. Shelled routes go inside an instance of the App Shell component; if no existing variant matches the app's arrangement, propose a VARIANT (approval-gated shared-master change), never ad hoc chrome.
3. Wire instance overrides so content matches the route: real strings from the code, correct block order, correct variant states.
4. Apply each Block's recorded mobile variant and overrides to Small; width alone does not specify mobile behavior. Match the measured mobile order, visibility, shell arrangement, and layout, which may differ from Large. If a required mobile variant or behavior is missing, record the Block unit that needs work and block Screen completion. Do not alter the Block master or compensate with screen-only overrides outside its exposed API.

## Shell unit

Reconcile against the existing App Shell material named in the plan. Every change to a shared master, and every new variant, is proposed with specifics and approved before it happens. If the plan left the intended shell as an open question, resolve that question with the user first.

## Approval gates (hard)

- NEVER create a variable without explicit user approval. Reuse-first, matched by resolved VALUE in the source Style mode and both Light/Dark modes, with semantic purpose verified; a proposal names the variable, collection, scopes, per-mode values, and why nothing existing fits.
- NEVER modify a shared master (existing kit sets, App Shell) without explicit approval.
- Drift discovered while building goes into the plan's hygiene list with a recommended code change and the substitution proposal. Retain original measurements and apply only approved targets. Do not edit source code as part of this build. Existing approval remains valid within its scope.

## QA (every unit, before calling it done)

- DOM comparison at 1440 and 375 in every required state: sizes, gaps, paddings, child order, visibility, wrapping, and shell arrangement. Compare to original measurements, explaining only documented effects of approved substitutions. Verify the actual border/layout model rather than applying a universal 1px correction.
- Binding audit: resolve every used binding through its alias chain in the recorded source Style mode, in Light and Dark. Detect missing targets and cycles. Compare numeric values and final RGBA channels to source measurements or their specifically approved substitution targets; check semantic token identity separately. Record any rounding tolerance and require zero unexplained mismatches.
- Unbound-paint scan on all non-instance nodes: zero solids without variable bindings.
- Render all four width/theme combinations: 1440 Light, 1440 Dark, 375 Light, 375 Dark. Explicitly set source Style and Light/Dark Mode on the test wrappers and compare each to its corresponding capture. Rebuild dark copies after light edits.
- Control-next-to-text alignment uses the line-box wrapper rule (Figma draws ink ~2px lower than Chrome); never padding hacks.
- Resize and overfill stress: smaller and larger widths, overfilled text props, every boolean combination on one instance.

## Kit naming (Pro v3.5, applied 2026-09-03)

Use **page** as the grouping level with page-relative component names; verify against the current kit. Pages: one page per group under section dividers `COMPONENTS · shadcn`, `COMPONENTS · Application`, … `BLOCKS · <Category>`, `APPS · <Category>`, `ICONS` (Icon Placeholder, Lucide, Tabler, Hugeicons, Phosphor, Remix), `UTILITY`; plain names, no `↳`; a block page that shares a component page's name ends in ` Blocks` (Sidebar Blocks, Chat Blocks, Progress Blocks). Names: on a component page the root set is the page name (`Button`, `Card`) and parts are the React export name (`CardHeader`, `CardFooter`); on a block page items are `<Name> <n>` (`Footer 4`, `Table 12`, functional names starting at 1 for app blocks: `Rep Leaderboard 1`) with support pieces under `Parts / <Name>`; on an app page screens are `Large`, `Small`, `Cover`, parts `Parts / <Name>`, compositions `Compositions / <Name>` (frames, never components); icons `<Library> Icons / <vendor-name>`; Pro charts on the Chart page as `Pro / <Kind> / <Variant>`. The site URL is derived, not written: section → tier and category, page → group, item → registry slug (`Footer 4` → `footer-4`); use the verified paths recorded in the plan; the historical manifest bundled with shadcncraft-import-app does not contain reconstructed paths. Numbers are identity: never renumber or reuse an existing block's number. Component and part names never use a `.` prefix; a part that supports one block or app stays under `Parts`; promote it to its own component page when two or more groups use it. Variant properties use the React prop name in camelCase (`variant`, `size`, `state`, `orientation`, `screenSize`) with React-verbatim value casing (`default`, `sm`, `lg`, `destructive`; design-only block states `state=default|loading|empty|error`), axis order variant → size → state → orientation → domain-specific.

## Wrap up

Set the unit to `built` only when required variants, responsive behavior, approvals, and all QA checks are complete with no unexplained mismatches. If an external dependency, missing variant, or approval prevents completion, set `blocked` with `blockedOn` identifying the issue and remedy; preserve partial-work IDs. If simply interrupted or QA is unfinished, retain `in-progress`. Save the plan and build notes (IDs, modes, responsive mappings, approvals, substitution targets, QA results, and remaining work). Report completion accurately and only identify dependent units as unblocked when this unit is actually `built`.

## Hard rules

- One unit per invocation. No drive-by edits to other units or unrelated nodes.
- fileKey only from the user's URL.
- Numbers come from the rendered DOM and the source code, never from screenshots or memory.
- `setProperties` invalidates node handles in that instance tree; re-find after every mutation. SLOT children are re-fetched after append.