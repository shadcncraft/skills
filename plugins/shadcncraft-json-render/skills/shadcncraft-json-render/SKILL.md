---
name: shadcncraft-json-render
description: Compose, edit or check JSON Render pages and app screens from shadcncraft blocks, using the installed @shadcncraft/json-render (Free) or @shadcncraft/json-render-pro (Pro) package. Use when building a landing page, marketing page, dashboard or app screen as JSON from shadcncraft blocks, choosing a block, writing or changing its copy, binding its buttons or forms to actions, reordering sections, or running the shadcncraft-json-render catalog or check CLI.
---

# shadcncraft JSON Render

This skill only finds the right package. The installed package's own
`SKILL.md` holds the real instructions and matches its version, so read it
every time and follow it over anything here.

## 1. Find the package

Run the detector from the project root (the folder with `package.json`):

```sh
node <this skill's directory>/scripts/detect.mjs
```

It prints JSON with `tier`, the installed package's `skill` (path to its
`SKILL.md`) and `cli.run` (the command for its CLI), and never prints the
licence key.

| `tier` | Do this |
| --- | --- |
| `pro` | Use `@shadcncraft/json-render-pro`. If `both` is true, ignore the Free package. |
| `free` | Use `@shadcncraft/json-render`. |
| `pro-not-installed` | `SHADCNCRAFT_LICENSE_KEY` is set: ask the user to install `@shadcncraft/json-render-pro` (see Install), then run the detector again. Until then, use Free if it is installed. |
| `none` | Ask before installing anything. Then install Free (see Install) and run the detector again. |

## 2. Follow the package's skill

1. Read the file at `installed.skill` in full before writing any JSON.
2. Wherever it says `npx shadcncraft-json-render`, you may use that, or
   `installed.cli.run` with the same arguments. Use `installed.cli.run` when
   `both` is true, so the Pro CLI answers.
3. Build only from the blocks that CLI's `catalog` lists. Never rely on a
   block, prop or limit from memory or from this file.
4. Finish with the package skill's Verify steps (`check`, then render).

## Install

Use the project's package manager (pnpm, yarn, bun or npm).

- **Free**:
  `npm install @shadcncraft/json-render @json-render/core@^0.22.0 @json-render/react@^0.22.0 zod@^4`
- **Pro**: `@shadcncraft/json-render-pro` comes from shadcncraft's private
  registry and needs a Pro React or Pro Figma + React licence in
  `SHADCNCRAFT_LICENSE_KEY`. Follow the install steps on shadcncraft.com.
  Never print, log or commit the key; reference the variable instead.

Without a licence, point the user to https://shadcncraft.com/pricing for Pro
blocks and carry on with Free.
