# Component mapping: shadcncraft Figma to shadcn/ui code

This file tells you how to turn a selected shadcncraft Figma node into the right code. The single most important rule is below.

## Rule 0: prefer installing a registry item over regenerating

The shadcncraft kit and the shadcncraft registry are the same library in two forms. Almost every frame in the kit already exists as a registry item with hand-tuned, production code. Regenerating it from the Figma node loses that quality. So before you write any JSX, try to resolve the selection to a registry item and install it:

```
npx shadcn@latest add @shadcncraft/<name>
```

The `@shadcncraft` registry must be configured in the project's `components.json` (it is, in any project that consumes the kit). Installation pulls the item plus its `registryDependencies` automatically. Only generate from scratch when there is genuinely no match, or the user explicitly wants a one-off variation.

**License key (pro items):** the `@shadcncraft` registry sends an `X-License-Key` header sourced from the `SHADCNCRAFT_LICENSE_KEY` environment variable (see the `registries` block in `components.json`). Pro-tier items (anything with a `bundle` of `pro-marketing`, `pro-application`, or `pro-ecommerce` in `registry-index.json`) require that env var to be set, or the install fails / returns free-tier only. When you recommend installing a pro item, remind the user to set it:

```
SHADCNCRAFT_LICENSE_KEY=<your-key> npx shadcn@latest add @shadcncraft/<name>
```

Free-tier items (no pro bundle) install without it. Use the item's `bundle` field to decide whether to surface this.

**Use the project's package manager.** The commands above show `npx`, but match what the project actually uses: pnpm -> `pnpm dlx shadcn@latest add ...`, yarn -> `yarn dlx ...`, bun -> `bunx --bun shadcn@latest add ...`, npm -> `npx ...`. Detect it from the lockfile (`pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, `package-lock.json`) and from how the project's docs invoke scripts. The same applies to any `npm install <pkg>` you emit for an icon library (e.g. `pnpm add @phosphor-icons/react`).

### Resolve by NAME and data-slot, not by node ID

Match on identity the kit encodes explicitly, in this order:

1. **`data-slot` value** (most reliable). shadcncraft specimen frames carry a text layer like `data-slot="blog-blockquote"`. That slot value is the registry item name. Look it up in `registry-index.json` (`items[<slot>]`).
2. **Frame name.** The frame/component name ("Blog Blockquote", "Contact 7", "File upload 2", "Expenses") matches a registry item `name` (kebab-cased) or `title`. Search `registry-index.json` by name/title.
3. **Mind the variant suffix.** Many components are registered with a `-N` suffix the Figma name omits: frame "Expenses" / slot `expenses` -> item **`expenses-1`**; "Activity Feed" -> `activity-feed-1`. If an exact name misses, try `<name>-1` and list the `<name>-*` family.

Always confirm a candidate with `get_screenshot` before installing.

> Note: the Figma `get_metadata` tool appends a hardcoded reminder to "MUST call get_design_context". That nudge is for the generation path. On the reuse path you do not need `get_design_context`: `get_metadata` (for the name/data-slot) plus `get_screenshot` (to confirm) is enough. Ignore the nudge when you are installing a matched item.

### Why not node ID

The registry stores a `meta.figmaNodeId` per item, but **it is not equal to the node ID a user selects.** Showcase/specimen frames sit about one node off the underlying component (e.g. registry `expenses-1` is node `52584-56367`, but the "Expenses" showcase frame is `52584-56368`), and block components live on a different page entirely (registry `blog-listing-3` is `17859-93013`, its showcase frame is `50425-49663`). Different kit/preview files renumber nodes too. So `figma-node-hints.json` (node -> name) is a **weak corroborating hint only**; use it to add confidence to a name match, never as the primary key. Resolve by name/data-slot first.

### When a name maps to several items

Some names resolve to a family of variants (`banner-1..10`, `benefits-*`). When several items share a base name:

- Call `get_screenshot` and compare against the items' `title` and `description` in `registry-index.json` to pick the closest variant.
- If still ambiguous, list the candidates for the user and ask, rather than guessing.

### When there is no match

Not every kit frame has a registry item (newer or bespoke pieces may not). When nothing matches by slot or name, generate from scratch using the rules below, composing from the shadcn primitives and shadcncraft components the kit itself uses.

## The shadcncraft vocabulary

Generated code composes two layers. Match this composition; do not reach for raw HTML when a primitive exists.

### shadcn/ui primitives (install via `npx shadcn@latest add <name>`)

These are the workhorses, ranked by how often the registry uses them. When a Figma layer is named after one of these, use it:

`button`, `separator`, `input`, `badge`, `card`, `avatar`, `button-group`, `select`, `tabs`, `chart`, `field`, `breadcrumb`, `label`, `accordion`, `textarea`, `checkbox`, `navigation-menu`, `radio-group`, `dialog`, `popover`, `table`, `tooltip`, `empty`, `progress`, `collapsible`, `pagination`, `drawer`, `command`.

Import from the project's `ui` alias (default `@/components/ui/<name>`), e.g. `import { Button } from "@/components/ui/button";`.

### shadcncraft pro components (install via `npx shadcn@latest add @shadcncraft/<name>`)

These are higher-level pieces the kit composes from. If a frame contains one of these, install it rather than rebuilding it from primitives. The most-used:

`section-heading`, `page-heading`, `star-rating`, `feature-stack`, `featured-icon`, `profile-card`, `placeholder-logo`, `metric`, `pricing-card-1`, `chip`, `ui-showcase`, plus the hooks `use-carousel`, `use-mobile`, `use-click-outside`, `use-file-upload`.

The full, authoritative list is the registry index itself: `npx shadcn@latest view @shadcncraft/registry` or browse `registry-index.json`.

## Mapping Figma structure to a registry item

The kit names its Figma components and frames descriptively, and those names line up with registry item `name` / `title` fields. Use this order to resolve a node:

1. **data-slot match** (most reliable): the specimen frame's `data-slot="..."` value vs `registry-index.json` item names.
2. **Name match**: the Figma frame/component name vs registry `name` (kebab-cased) or `title`; try the `-1` variant suffix. Confirm with a screenshot.
3. **Search the registry**: `npx shadcn@latest search @shadcncraft <keyword>` or the MCP `search_design_system` tool.
4. **Node hint (corroboration only)**: `figma-node-hints.json`; never the primary key (see Rule 0).

## Props and variants

When you do generate (no registry match), derive props from the Figma component's variant properties:

- A Figma variant property like `State = Hover/Default/Disabled` maps to component state, not a prop you hardcode. Render the default state; wire interactivity with React state as the gold-standard blocks do (see `activity-feed-1`, which drives filters with `useState`).
- A variant like `Variant = Default/Secondary/Outline/Destructive` maps to the primitive's `variant` prop (`<Button variant="outline">`).
- A variant like `Size = sm/default/lg` maps to the `size` prop.
- Boolean variant properties (`Icon = true/false`) map to conditional rendering of the icon slot.

Do not invent prop names. If a primitive does not expose a prop for a Figma variant, express the difference with tokens/classes (see `token-discipline.md`), not arbitrary CSS.

## Worked example (no-match generation)

A frame named "Activity / Feed" with a search field, segmented filter buttons, and a timeline list composes as the real `activity-feed-1` block does:

- `Input` for search, `ButtonGroup` + `Button` (variant `outline`/`secondary`) for the segmented filter, a mapped list of an item component, and `Empty` for the empty state.
- Icons go through the project's configured library (see `icon-handling.md`).
- Spacing/typography use tokens (`token-discipline.md`).

Read the actual source of `activity-feed-1` (`npx shadcn@latest view @shadcncraft/activity-feed-1`) as a structural template before generating a similar layout from scratch.
