# Component build recipes (use_figma patterns proven in kit builds)

All scripts: plain JS, `return` structured data + all created/mutated node IDs, `await figma.setCurrentPageAsync(page)` once at the top, load every font before touching text (`Geist Medium/Regular`, `Geist Mono Medium`, plus whatever the file reports).

## Plan contract recap

- This skill builds `component`-level units only. Start from `approved`, or resume `in-progress`, with all `dependsOn` at `built`. Before a resumed mutation, reconcile saved IDs and completed steps with Figma, verify ownership and destination, and reuse existing work. Resolve ambiguous state before creating or replacing objects. Write `in-progress` before the first mutation; write `built` only after QA passes. Persist IDs, steps, approvals, and remaining work after each logical step.
- `measure` on the unit is the capture recipe (routes, rootSelector, states); fill `captures` and `measurements` at build time. Prefer headless capture (CDP) so screenshots land on disk, not in context; dark via the app's toggle or the `dark` class on `<html>`.

## Recorded modes and QA targets

Use the source Style mode and Light/Dark Mode IDs verified during intake. Resolve candidates in those modes and verify semantic purpose. Do not select a token based on an inherited/default mode or equal value alone. Explicitly set both collections on QA wrappers.

Keep source measurements unchanged. Store each approved substitution in the build notes with part/state, property, mode combination, original value, target token and resolved value, reason, code recommendation, and approval. Existing approval remains valid within its scope. Unapproved substitutions are unresolved work, not QA exceptions.

## 1. Base variant, fully bound

- `figma.createComponent()`, layoutMode, `resize(w,h)` BEFORE sizing modes, primary FIXED / counter AUTO as the DOM dictates.
- `setBoundVariable` for itemSpacing, all four paddings, all four radii, minHeight, all four strokeWeights (`strokeTopWeight` etc.). Targets: `pro/space/*` and `pro/radius/*` (the pro indirection layer carries per-style density; raw Tailwind primitives freeze one density and break style switching). `strokeAlign='INSIDE'`; verify the resulting child offsets against the measured web border/layout model.
- Paints: `node.fills = [figma.variables.setBoundVariableForPaint({type:'SOLID', color:{r:0,g:0,b:0}}, 'color', modeVar)]` - returns a NEW paint, capture it. Colors bind to Mode tokens.
- Text: create, `appendChild`, `textAutoResize='HEIGHT'`, `layoutSizingHorizontal='FILL'`, `setTextStyleIdAsync` to an existing bound style, bound fill.
- Control-next-to-text: wrapper frame, height BOUND to the text's line-height var, `counterAxisAlignItems='CENTER'`, control inside. Figma draws ink ~2px lower than Chrome; this wrapper matches the web within ~1px. Never padding hacks on token-bound values.
- Effects: reuse existing effect styles (`shadows/control`, focus styles) where the CSS calls for them; a NEW effect style is an approval-gated proposal.

## 2. Props before combine

```js
const key = comp.addComponentProperty('label', 'TEXT', 'Label');
textNode.componentPropertyReferences = { characters: key };
wrapper.componentPropertyReferences = { visible: boolKey };
```

On the BASE component; clones inherit definitions and same-named props merge at `combineAsVariants`. Booleans controlling hidden-by-default parts: node invisible AND default false. Icons go in INSTANCE_SWAP slots.

## 3. Clone-and-mutate variants

Loop the state specs from the DOM measurements, `base.clone()`, rename to the full `prop=value` string, preserving React prop and value casing (for example, `screenSize=sm`), mutate per state (hover bg, checked bg+border, focus stroke + focus effect, disabled via the kit opacity var), then `figma.combineAsVariants(comps, parent)`, name the set, grid-position children by axis (they stack at 0,0), `resizeWithoutConstraints` the set, write the set description (source-file marker + accepted divergences).

## 4. Variable proposal format (when reuse genuinely fails)

Propose before creating, wait for yes: name, collection, type, scopes, value (or per-mode values), and the reuse candidates checked with why each fails (match by resolved VALUE in the recorded source Style mode and both Light/Dark modes, and verify semantic purpose). In customer copies new vars are file-local; in kit-maintenance mode follow `component/pro/...` namespacing.

## 5. Audits

- Value audit: resolve every binding in the source Style mode, in both Light and Dark, following each alias through its collection's selected mode and detecting missing targets/cycles. Compare numeric values and final RGBA channels to the unchanged Phase 0 table, using approved substitution targets only for their recorded property/state/modes. Check semantic token identity separately, record any rounding tolerance, and require zero unexplained mismatches.
- Unbound paint audit: walk all non-instance nodes; flag SOLID fills/strokes without `boundVariables.color`.
- Geometry: compare `absoluteTransform` offsets against DOM `getBoundingClientRect` numbers. Account for the measured border/layout model and documented layout effects of approved substitutions; do not assume a universal 1px offset.
- `setProperties` invalidates node handles in that instance tree - re-find after every mutation; SLOT children re-fetched after append. Timed-out `use_figma` calls may still have applied; check state before retrying.
