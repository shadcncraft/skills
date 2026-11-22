# shadcncraft JSON Render plugin

One skill, `shadcncraft-json-render`, for Claude Code and Codex. It finds the
shadcncraft JSON Render package installed in your project and hands the agent
that package's own `SKILL.md` and CLI (`catalog`, `check`, `deps`), so the
instructions always match the package version you have. Upgrading the package
upgrades the guidance; the plugin rarely needs an update.

| Installed | Agent uses |
| --- | --- |
| `@shadcncraft/json-render-pro` | Pro blocks, Pro skill and CLI |
| `@shadcncraft/json-render` only | Free blocks, Free skill and CLI |
| Neither, `SHADCNCRAFT_LICENSE_KEY` set | Asks you to install Pro |
| Neither | Offers to install Free |

## Install the plugin

Claude Code:

```sh
claude plugin marketplace add shadcncraft/skills
claude plugin install shadcncraft-json-render@shadcncraft
```

Codex:

```sh
codex plugin marketplace add shadcncraft/skills
```

Then open `/plugins` in Codex, pick **shadcncraft JSON Render** from the
shadcncraft marketplace, and start a new session.

To stay on a reviewed release, add the marketplace at a tag, for example
`shadcncraft/skills#shadcncraft-json-render--v0.1.0` (Claude Code) or
`--ref shadcncraft-json-render--v0.1.0` (Codex).

## Install the package

Free, from npm:

```sh
npm install @shadcncraft/json-render @json-render/core@^0.22.0 @json-render/react@^0.22.0 zod@^4
```

Pro (`@shadcncraft/json-render-pro`) needs a Pro React or Pro Figma + React
licence; set `SHADCNCRAFT_LICENSE_KEY` and follow the install steps on
shadcncraft.com.

## Use

Ask for a page: "Build a landing page for Acme Analytics with pricing and an
FAQ as JSON Render." In Claude Code you can also run
`/shadcncraft-json-render:shadcncraft-json-render`.

## Versioning

The plugin version is set in `plugin.json`, `.claude-plugin/plugin.json` and
both marketplace files, and must match in all four. Bump it on every change
and tag the commit `shadcncraft-json-render--v<version>`.
