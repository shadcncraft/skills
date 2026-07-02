# Managed region and the merge contract

The cardinal rule of this skill is **merge, do not clobber**. Users hand-edit `globals.css`: they add font imports, `@theme` blocks, custom utilities, plugin directives, one-off variables. Overwriting the file destroys that work and erodes trust. So updates are confined to a clearly marked managed region; everything outside it is untouchable.

## The managed region convention

Wrap the tokens this skill writes in sentinel comments:

```css
/* shadcncraft:tokens:start. Managed by shadcncraft-import-variables. Edit source tokens, not this block. */
:root {
  /* ...mapped light tokens... */
}

.dark {
  /* ...mapped dark tokens... */
}
/* shadcncraft:tokens:end */
```

- On every run, replace **only** the content between `shadcncraft:tokens:start` and `shadcncraft:tokens:end`.
- Never touch anything above `:start` or below `:end`.
- Preserve the sentinel lines exactly so the next run can find the region.

## First run vs subsequent runs

**Subsequent run (sentinels present):** find the region, regenerate the `:root` and `.dark` blocks inside it from the resolved source, leave the rest of the file byte-for-byte identical.

**First run (no sentinels yet):** the project already has `:root` / `.dark` blocks from `npx shadcn init`. Do not blindly prepend a second copy.
1. Locate the existing `:root` and `.dark` blocks.
2. Wrap them in the sentinels in place (convert them into the managed region) and update their values, OR if they are entangled with other rules, extract the token declarations into a fresh managed region and remove the originals.
3. Confirm there is exactly one `:root` token block and one `.dark` token block afterward; duplicate `:root` blocks cause last-wins surprises.

When the existing file is non-trivial and you are unsure how to carve the region cleanly, show the user the planned edit (a diff) before writing.

## Merge rules for individual tokens

- **Within the managed region**, the resolved source is authoritative: overwrite token values.
- **Preserve token names the project uses that the source omits.** If the project's `:root` defines a token (e.g. a custom `--brand-2`) that your source has no value for, keep the existing line rather than dropping it. Only replace what you have a new value for; do not silently delete tokens.
- **Completing the core set is intended, not clobbering.** If the existing managed region is missing core shadcn tokens that the source provides (e.g. it has `--primary` but no `--secondary`/`--accent`/`--popover`), add them so the set is complete across `:root` and `.dark`. Expanding the managed block this way is correct; it is the skill's job. Call out the newly added tokens in the report so the growth is not a surprise.
- **Do not migrate value formats unnecessarily.** If the project stores colors as `oklch(...)` and your source is HSL, convert to match the project's existing convention so the file stays consistent (see `token-mapping.md`).
- **Never move or rewrite** the `@theme` / `@theme inline` block, `@import`s, `@plugin`s, `@custom-variant`s, or any computed `--radius-*` / `--color-*` mappings. Those live outside the managed region and are not yours to edit.


## Safety

- Read the file before editing; confirm it is the `globals.css` referenced by `components.json` `tailwind.css`.
- Make a single, reviewable edit. For a first-run carve-out or any large change, present the diff first.
- After writing, re-read the region to confirm both `:root` and `.dark` are present and balanced, and that the sentinels are intact.

## Report

Tell the user: which source was used, how many tokens were written/updated, that everything outside the managed region was preserved, and surface any source variables that did not map to a shadcn token (left out by design).
