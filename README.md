# shadcncraft Agent Skills

Agent Skills for the [shadcncraft](https://shadcncraft.com) design system, the in-editor (Claude Code / Cursor / Codex) companion to the [Figma plugin](https://shadcncraft.com/figma/plugin). They turn the shadcncraft Figma kit into production React + shadcn/ui code and keep a project's theme in sync with its design tokens.

Built to the [Agent Skills open standard](https://github.com/anthropics/skills): each skill is a folder with a `SKILL.md` (YAML frontmatter + instructions) and modular `references/`. SKILL.md stays lean; detail lives in `references/` and is read on demand (progressive disclosure).

## Skills

| Skill | What it does |
| --- | --- |
| [`shadcncraft-generate-code`](https://shadcncraft.com/docs/agent-skills/generate-code) | Convert a selected shadcncraft Figma frame/component/page into React + shadcn/ui code via the official Figma MCP. Reuses the matching registry block, stays on the project's tokens, emits icons from the project's configured library. |
| [`shadcncraft-import-variables`](https://shadcncraft.com/docs/agent-skills/import-variables) | Sync design tokens into `globals.css` as a complete shadcn token set (light + dark). Source-agnostic (UI Rules / Figma MCP / local file), merges into a managed region without clobbering customizations. |

## Prerequisites

- A project that consumes shadcncraft: has `components.json` (with the `@shadcncraft` registry configured) and a `globals.css` with the shadcn token block.
- The official **Figma MCP** connected for Figma-sourced flows.
- Skills are tool-agnostic and work in Claude Code, Cursor, and Codex.

## Install

```bash
npx skills add shadcncraft/skills
```

## Access & tiers

The skill files install freely (they're just instructions); what they can *do* depends on what they touch:

| Skill | Who can use it | Why |
| --- | --- | --- |
| `shadcncraft-import-variables` | **Everyone** | Only reads design tokens and writes `globals.css`. Touches no pro blocks, so no license key is needed. |
| `shadcncraft-generate-code` | **Pro React or Pro Figma + React customers** | Installs shadcncraft React pro blocks. The registry serves those only to a valid `SHADCNCRAFT_LICENSE_KEY` from a React-shipping product (Pro React or Pro Figma + React), so without one it can't produce real output. This mirrors the Figma plugin's generate-code restriction. The skill checks the key up front and points you to [pricing](https://shadcncraft.com/pricing) if it's missing, instead of shipping a generic fallback. |

## License

Two separate things, licensed separately:

- **The skills** (this package: `SKILL.md` instructions, `references/`, and the installer) are **MIT-licensed and free to use**. Install and run them in any project, no license key required to *install*. See [`LICENSE`](LICENSE).
- **The registry blocks the skills install** are a different matter. **Free-tier blocks** work as-is; **pro blocks require a commercial shadcncraft license** (a valid Pro React or Pro Figma + React `SHADCNCRAFT_LICENSE_KEY`), governed by the [shadcncraft license](https://shadcncraft.com/license). The paywall is enforced server-side by the registry, not by the skills.

In short: the skills are open and free to install; the pro blocks they pull in are the paid product, and `generate-code` is only useful with a Pro React or Pro Figma + React license (see Access & tiers above).

## Relationship to other shadcncraft surfaces

- **Figma plugin**: in-Figma generate-code workflow. These skills are the in-editor counterpart; they complement, not replace, the plugin.
- **UI Rules** ([uirules.com](https://uirules.com)): a separate MCP that serves brand rules and a `globals.css`. Private alpha; NOT required for v1. `import-variables` is designed to use it as the top-priority token source once available. No UI Rules account is needed today.
