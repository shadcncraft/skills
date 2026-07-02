# Icon handling

shadcncraft ships across five icon libraries (Lucide, Tabler, Hugeicons, Phosphor, Remix). In Figma these are switched natively via the styles collection. In code, the choice lives in one place: `components.json`. Generated code must honor that choice and emit real, importable export names. A wrong icon name is a build break, and these libraries disagree on names constantly.

## Step 1: read the project's configured library

Read `iconLibrary` from the project's `components.json`:

```json
{ "iconLibrary": "lucide" }
```

Valid values: `lucide` (default), `tabler`, `hugeicons`, `phosphor`, `remixicon`. Everything you emit must come from this one library. Do not mix libraries in generated output.

## Step 2: resolve each icon's name

The kit authors icons against **canonical Lucide names** (the Figma layer/component name is the Lucide name). To emit the right export for the configured library:

1. Take the canonical name from the Figma icon.
2. Look it up in `icon-name-map.json` -> `icons[<CanonicalName>]` -> the value for `iconLibrary`.
3. Import using the `import_paths` block in that same JSON.

Example, project configured as `phosphor`, Figma icon "Bolt":
- `icons["Bolt"]["phosphor"]` -> `LightningIcon` (note: not "Bolt"; the libraries diverge semantically).
- `import { LightningIcon } from "@phosphor-icons/react";`

If the project is `lucide` (the common case), the canonical name usually is the import name directly:
```tsx
import { FolderOpen } from "lucide-react";
// ...
<FolderOpen className="size-4" />
```

## Step 3: handle misses and traps

- **Name not in the map:** fall back to the library's documented naming convention (see `naming_conventions` in the JSON), emit your best candidate, and explicitly flag it in your summary as "verify this icon import" rather than presenting it as certain. Never fail silently.
- **Hugeicons duplicate-name bug:** the free Hugeicons set contains garbled/doubled export names (a "smilesmile" style doubling). Never derive a Hugeicons name by doubling or by blindly appending a weight number. If the map lacks the Hugeicons value, surface it for review.
- **Hugeicons render shape:** Hugeicons are not direct components. Render via `<HugeiconsIcon icon={ArrowRight01Icon} />` from `@hugeicons/react`, importing the icon data from `@hugeicons/core-free-icons`.
- **Phosphor / Remix suffixes:** Phosphor uses an `Icon` suffix (`ArrowRightIcon`); Remix uses `Ri` + `Line`/`Fill` (`RiArrowRightLine`). The map records the exact form.

## Do NOT use `IconPlaceholder` in generated app code

The shadcncraft **registry source** uses an internal `IconPlaceholder` component that carries all five library names at once and picks one at runtime:

```tsx
// registry authoring pattern, NOT for generated consumer code
<IconPlaceholder
  lucide="FolderOpen" tabler="IconFolderOpen" hugeicons="FolderOpenIcon"
  phosphor="FolderOpenIcon" remixicon="RiFolderOpenLine"
/>
```

That exists so one registry source can serve every library. A normal consumer project does not have `@/registry/icons/icon-placeholder`. When you **generate** code for a user's app, resolve the single configured library and emit a direct import (Steps 1-3). You will only see `IconPlaceholder` when you **install** a registry block via the shadcn CLI; leave it as-is in that case; the registry handles it.

## Sizing

Match the kit's sizing with tokens, not arbitrary values: `size-4` (16px) is the default inline icon size, `size-5`/`size-6` for larger. Inherit color via `currentColor` (no color class needed unless the design calls for a specific semantic token).
