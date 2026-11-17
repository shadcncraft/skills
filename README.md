# shadcncraft Agent Skills

Agent Skills for the [shadcncraft](https://shadcncraft.com) design system, for Claude Code, Cursor, and Codex. They turn shadcncraft Figma designs into React + shadcn/ui code, bring React UI back into your Figma kit, and keep your theme in sync with your design tokens.

Each skill follows the [Agent Skills open standard](https://github.com/anthropics/skills): a folder with a `SKILL.md` and supporting `references/`. Full docs: [shadcncraft.com/docs/agent-skills](https://shadcncraft.com/docs/agent-skills/getting-started).

## Skills

### Figma to React

| Skill | What it does |
| --- | --- |
| [`shadcncraft-generate-code`](https://shadcncraft.com/docs/agent-skills/generate-code) | Convert a selected shadcncraft Figma frame, component, or page into React + shadcn/ui code via the official Figma MCP. Reuses the matching registry block, stays on your project's tokens, and uses your configured icon library. |
| [`shadcncraft-import-variables`](https://shadcncraft.com/docs/agent-skills/import-variables) | Sync design tokens into `globals.css` as a complete shadcn token set (light + dark). Reads from the Figma MCP or a local file and merges into a managed region without overwriting your customizations. |

### React to Figma

| Skill | What it does |
| --- | --- |
| [`shadcncraft-import-app`](https://shadcncraft.com/agent-skills#figma-import) | Scan a React app built on shadcn/ui and write an import plan: what maps to existing kit components, what needs a custom Component or Block, which screens and app shell it has, plus token drift and code hygiene flags. Read-only: it never edits your code or your Figma file. |
| [`shadcncraft-import-component`](https://shadcncraft.com/agent-skills#figma-import) | Build one approved custom Component from the plan as a Figma component set, with variants and states taken from your React source and the rendered DOM. |
| [`shadcncraft-import-block`](https://shadcncraft.com/agent-skills#figma-import) | Build one approved Block, screen, or app shell from the plan. Blocks are composed from kit instances; screens are built at 1440 and 375. |

How the three work together:

1. `import-app` writes `import-plan.md` for you to review and approve, and `import-plan.json` for the build skills.
2. `import-component` and `import-block` build one approved unit per run, in dependency order. They first measure the running app in light and dark, saving captures under `.shadcncraft/captures/`. Progress is saved to the plan, so an interrupted build resumes instead of starting over.
3. Approving the plan approves the build order only. New variables, changes to existing kit components, and token substitutions are each proposed and wait for your approval.

## Requirements

- Claude Code, Cursor, Codex, or another agent that supports Agent Skills.
- The official **Figma MCP**, connected.
- **Figma to React:** a project set up for shadcncraft, with the `@shadcncraft` registry in `components.json` and a `globals.css` that has the shadcn token block.
- **React to Figma:** your own copy of the shadcncraft Figma kit, and a React app built on shadcn/ui (local folder or GitHub URL). The two build skills also need a Figma MCP that can write to the canvas and a running dev server. These are long workflows, so use the most capable model your editor offers.

## Install

```bash
npx skills add shadcncraft/skills
```

Or use the npm installer, which can target specific agent tools:

```bash
npx @shadcncraft/skills add all
```

Restart your agent to pick up the new skills. More in the [installation guide](https://shadcncraft.com/docs/agent-skills/installation).

## Plugins

This repository is also a plugin marketplace for Claude Code and Codex.

| Plugin | What it does |
| --- | --- |
| [`shadcncraft-json-render`](plugins/shadcncraft-json-render) | Compose and check [JSON Render](https://github.com/vercel-labs/json-render) pages from shadcncraft blocks. Uses the installed `@shadcncraft/json-render` (Free) or `@shadcncraft/json-render-pro` (Pro) package's own skill and CLI, so it stays current as the package updates. |

Claude Code:

```bash
claude plugin marketplace add shadcncraft/skills
claude plugin install shadcncraft-json-render@shadcncraft
```

Codex: `codex plugin marketplace add shadcncraft/skills`, then install **shadcncraft JSON Render** from `/plugins`.

## Access

The skills are free to install. What each one can do depends on what it touches:

| Skill | Who can use it |
| --- | --- |
| `shadcncraft-import-variables` | **Everyone.** It only reads design tokens and writes `globals.css`. |
| `shadcncraft-import-app`, `shadcncraft-import-component`, `shadcncraft-import-block` | **Anyone with a copy of the shadcncraft Figma kit.** They work in your own code and your own Figma file, so no license key is needed. |
| `shadcncraft-generate-code` | **Pro React or Pro Figma + React customers.** It installs pro blocks from the shadcncraft registry, which requires `SHADCNCRAFT_LICENSE_KEY`. Without a key, the skill points you to [pricing](https://shadcncraft.com/pricing). |

## License

- The skills in this repository (instructions and references) are [MIT](LICENSE) licensed.
- The registry blocks that `generate-code` installs are licensed separately. Free blocks work as is; pro blocks require a Pro React or Pro Figma + React license under the [shadcncraft license](https://shadcncraft.com/license).

## Related

- [Figma plugin](https://shadcncraft.com/figma/plugin): generates code from inside Figma. These skills are its in-editor counterpart.
- [UI Rules](https://uirules.com): a companion MCP for your design rules. Support in `import-variables` is coming soon and will never be required.
