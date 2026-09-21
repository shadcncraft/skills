---
name: shadcncraft-import-app
description: "Break a React app built on shadcn/ui and the shadcncraft kit into an approved, unit-by-unit Figma import plan - repo scan, classification into Components, Blocks, screens, and shell material, token sync and code hygiene checks, and light/dark measurement targets. Use whenever someone wants to bring their app, product, template, or repo into Figma, mirror their React app in the shadcncraft kit, asks to import an app or codebase into Figma, or asks where to start importing a multi-screen product. This skill produces the plan only and never writes to Figma; the companion skills (shadcncraft-import-component, shadcncraft-import-block) execute the units. Also use to re-scan an app after code changes to refresh an existing import plan."
---

# shadcncraft: import an app (scan and plan)

**Skill version: 11 (2026-09-11, versioned manifest reads and resumable plans).** State this version number when you load the skill so the user can verify which build is running.

Turn a React app built on shadcn/ui into a classified, dependency-ordered import plan that the build skills execute one unit at a time. This skill reads source and Figma, and writes only local planning artifacts. It never modifies source code, installs dependencies, runs the app, writes to Figma, creates variables, or mirrors content to external services. It produces a markdown plan for human approval and `import-plan.json` for the downstream skills.

**Recommended model**: run this on Fable, or at minimum Opus 5. The workflow depends on measurement discipline and codebase-scale reasoning that lower tiers reliably miss.

**Audience**: written customer-first. The user's Figma file is a copy of the shadcncraft kit; derive the fileKey from the frame URL they give you. Internal kit-maintenance runs work the same way, just against the Pro file.

## Intake (ask, never assume)

1. Figma frame or file URL for the import. Derive the fileKey and verify the file opens via the Figma MCP. If the URL has no node ID, obtain a target frame URL before planning build destinations. Verify the target node resolves before scanning; if it does not, ask for a fresh URL. Confirm Tailwind, Mode, and Style collections exist.
2. Establish `runMode`: `customer-copy` or `kit-maintenance`, using the user's confirmed intent for this target file. A file name alone does not establish that it is the shared Pro library. Reuse prior confirmation for the same target and scope; otherwise confirm before classifying work. Record it in the plan. Customer-copy pieces remain local; shared-master changes require their own explicit approval.
3. Repo path (local folder or GitHub URL) and scope: whole app, or specific routes/areas.

No dev server and no rendering at plan time: this skill is a pure source scan plus Figma reads. Screenshots and DOM measurement happen per unit at build time (shadcncraft-import-component and shadcncraft-import-block do them); do not capture anything here. Light AND dark are always in scope; never ask. Token sync status is checked, not asked.

## Step 1 - Kit context

Read `references/plan-schema.md` now (the output contract) and keep `references/scan-rules.md` open for steps 2-4.

Via the Figma MCP on the USER'S file: verify the three collections exist, list their modes, and spot-check the wiring (a Mode color aliasing color/light + color/dark leaves; `pro/space/*` presence). If the file is not a kit copy, stop and tell the user what is missing. Never modify anything.

**The bundled manifest is a historical v1 index for kit v3.4, generated 2026-08-11. It is not a complete current inventory.** Check `manifestVersion` before reading fields, and preserve its provenance. Do not relabel it as a newer kit release without a fresh verified inventory.

- Version 1 (the bundled format): look up names in `baseComponents`, `proApplicationComponents`, and `proApplicationBlocks`; entries use `pageId`, optional `setId`, and optional `also` maps for parts. `apps` is an array; `utility.components` maps names to IDs. `proMarketing` contains discovery notes, not an inventory. Missing IDs or groups mean unknown, not absent.
- Version 2 (if a verified replacement is supplied): use `components.<Category>.<Group>`, `blocks.<Category>.<Group>`, `apps.<Category>.<App>`, `icons`, and `utility`; node entries use `nodeId`, `type`, and `pageId`. Inspect the supplied structure before iterating. Unsupported versions require a compatible index or scoped live discovery, never guessed field mappings.
- All lookups target the fileKey from the user's URL. Historical IDs are hints, not proof that a node exists in this copy. Resolve each candidate in the target file and verify its type and identity through its source/data-slot description, family/page context, and variant properties. Record verified IDs in the plan's `kitMatch` structure.
- If an ID is missing, stale, or points to the wrong object, inspect the relevant page or named family in the target file. A page-list read to locate that family is allowed; avoid whole-file descendant enumeration. If a page cannot be identified, ask for a targeted component/frame link.
- Publication status and published-asset searches do not establish whether a local component exists. Use live target-file evidence. Do not run a publishing audit or propose publishing as part of this skill.
- Manifest misses never establish absence. After scoped live checks, record the evidence; if still uncertain, put the match in open questions and block affected units rather than guessing.
- Record the manifest's actual version/provenance and any mismatches in the plan. Full inventory regeneration is separate maintenance. Normal imports may proceed using verified scoped matches without rewriting the bundled index.

## Step 2 - Token sync check

Diff the app's `globals.css` (and any theme CSS) against the file's Mode/Style variable values, using the shadcn token name mapping and explicit Style plus Light/Dark mode selections. Resolve aliases in each collection's selected mode, detecting missing targets/cycles, and compare final numeric/RGBA values with a documented tolerance. If style selection is unresolved, token sync is `unverified`; record candidate findings without claiming a match or choosing a default. Direction of truth: Figma exports to code via shadcncraft-import-variables, so drift is reported as "regenerate globals.css from Figma" or "get this token into Figma first", never "import the app's value into Figma". Every mismatch goes in the hygiene report with the exact recommendation.

## Step 3 - Scan and classify

Follow `references/scan-rules.md` in full. In short:

- Map the repo: `package.json`, `components.json`, framework and router shape, route/layout tree, `components/ui/*`, root `components/`, feature directories. Build the import graph so composition hierarchy and dependencies are known.
- Classify every module into exactly one of: kit primitive instance (name the kit set; diff against stock shadcn first), existing Pro piece match, custom Component, custom Block, shell material, screen (a route's composed view), or out-of-scope (hooks, lib, server-only logic, third-party UI). Site taxonomy is Components, Blocks, Apps; screens and shells are levels inside an app import, both executed by shadcncraft-import-block.
- Detect the shell: a persistent sidebar/topbar layout wrapper means App Shell; plain page flow means shell-less screens.
- Detect the app's style: match globals.css and primitive classNames against the 8 kit style signatures; record candidates and confidence. Select a source Style mode only when supported by evidence or explicit user confirmation. Save its live name/ID and Light/Dark Mode IDs; uncertain matches remain unresolved and block affected builds.
- Apply the default policies (modified primitives, icons, assets, fonts, third-party UI, blocked units) exactly as written in scan-rules; every policy hit is a plan note or hygiene flag, never a silent decision.

## Step 4 - Measurement targets (no rendering)

For each unit, record in the plan WHAT the build skill must measure, not the measurements: the route(s) that render it, the root element selector or component boundary, and any states worth capturing (open dialogs, hover-dependent parts). The build skills capture and measure at build time, so measurements are always fresh and only approved units ever cost anything.

## Step 5 - Emit the plan

Produce both artifacts per `references/plan-schema.md`:

- `import-plan.md`: readable summary for approval - app profile, style match, token sync status, the unit table (topologically sorted; level order used only as a tie-breaker) with sizes and dependencies, the hygiene report, approval/substitution proposals, and open questions. Dependency order takes precedence over level order.
- `import-plan.json`: the machine contract the downstream skills consume - same content, structured, with stable unit IDs, dependency edges, measurement targets, and status fields.

Deliver both files and save them to the session's project so later sessions can resume. Keep the JSON and readable plan consistent. Do not mirror them to any external service as part of this workflow.

Validate the plan using the rules in `references/plan-schema.md`. Then get explicit approval (or edits) before any build skill runs. Record exactly which plan revision/units were approved. Plan approval does not automatically approve new variables, shared-master changes, or substitutions; record those separately with their exact scope. Existing explicit approvals remain valid for unchanged work within that scope and do not require reconfirmation.

## Kit naming (Pro v3.5, applied 2026-09-03)

Use **page** as the grouping level with page-relative component names; verify against the current kit. Pages: one page per group under section dividers `COMPONENTS · shadcn`, `COMPONENTS · Application`, … `BLOCKS · <Category>`, `APPS · <Category>`, `ICONS` (Icon Placeholder, Lucide, Tabler, Hugeicons, Phosphor, Remix), `UTILITY`; plain names, no `↳`; a block page that shares a component page's name ends in ` Blocks` (Sidebar Blocks, Chat Blocks, Progress Blocks). Names: on a component page the root set is the page name (`Button`, `Card`) and parts are the React export name (`CardHeader`, `CardFooter`); on a block page items are `<Name> <n>` (`Footer 4`, `Table 12`, functional names starting at 1 for app blocks: `Rep Leaderboard 1`) with support pieces under `Parts / <Name>`; on an app page screens are `Large`, `Small`, `Cover`, parts `Parts / <Name>`, compositions `Compositions / <Name>` (frames, never components); icons `<Library> Icons / <vendor-name>`; Pro charts on the Chart page as `Pro / <Kind> / <Variant>`. The site URL is derived, not written: section → tier and category, page → group, item → registry slug (`Footer 4` → `footer-4`); record verified paths in the plan; the bundled historical manifest does not contain reconstructed paths for every node. Numbers are identity: never renumber or reuse an existing block's number. Component and part names never use a `.` prefix; a part that supports one block or app stays under `Parts`; promote it to its own component page when two or more groups use it. Variant properties use the React prop name in camelCase (`variant`, `size`, `state`, `orientation`, `screenSize`) with React-verbatim value casing (`default`, `sm`, `lg`, `destructive`; design-only block states `state=default|loading|empty|error`), axis order variant → size → state → orientation → domain-specific.

## Hard rules

- No Figma writes, ever, from this skill.
- Drift and policy hits are flagged with recommendations, never silently fixed or absorbed.
- Numbers in the plan come from source code; rendered-DOM measurement belongs to the build skills at build time.
- One classification per module; when genuinely ambiguous, put it in open questions rather than guessing.
- If the scan finds more than ~40 units, say so and propose scoping down to one area for the first pass.