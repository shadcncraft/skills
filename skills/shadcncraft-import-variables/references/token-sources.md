# Token source resolution

The import-variables skill is deliberately source-agnostic: the same mapping and merge logic runs no matter where the tokens come from. Resolve the token source in this priority order and stop at the first one available. Tell the user which source you used.

## Order of resolution

### 1. UI Rules MCP (coming soon, do not block on it)

[UI Rules](https://uirules.com) is a forthcoming MCP that serves a project's brand rules and a ready `globals.css`. When it is connected, it is the highest-fidelity source: it already speaks shadcn token names, so mapping is near pass-through.

- Detect it by checking for UI Rules MCP tools in the connected tool list.
- **It is in private alpha and is NOT required for v1.** Do not require a UI Rules account, do not prompt the user to sign up, and never fail because it is absent. If it is not connected, fall straight through to source 2.
- A shadcncraft purchase will eventually grant a UI Rules trial; surfacing that is a roadmap item, not a v1 behavior.

### 2. Official Figma MCP variables (the v1 default)

If the Figma MCP is connected and the user points at the shadcncraft kit file (or a node in it), pull variables with `get_variable_defs`.

- This is the primary v1 path. The kit's variable collections and modes map to shadcn `:root` / `.dark` tokens.
- See `references/figma-collections.md` for the kit's collection/mode structure and `references/token-mapping.md` for the variable-name -> shadcn-token mapping.

### 3. Local `globals.css` or exported tokens file (fallback)

If neither MCP is available, ask the user to point at an existing token source already in the repo:

- An existing `globals.css` (re-map / repair its `:root` and `.dark` blocks), or
- An exported tokens file (Figma Tokens / Style Dictionary JSON, a CSS/SCSS variables file, etc.).

Parse it, map to shadcn token names, and proceed through the same merge logic.

## After resolving the source

Regardless of source, the rest of the flow is identical:

1. Map source tokens to shadcn token names for `:root` (light) and `.dark` (see `token-mapping.md`).
2. Merge into the project's `globals.css` inside the managed region, preserving everything outside it (see `managed-region.md`).
3. Report what changed and which source was used.

## Why this abstraction exists

Keeping the source behind a clean interface means UI Rules can slot in as source 1 later without touching the mapping or merge logic, and these reference files can migrate into UI Rules MCP payloads with little change. Do not entangle source-specific parsing with the mapping/merge steps.
