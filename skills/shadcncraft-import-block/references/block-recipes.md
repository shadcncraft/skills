# Block and screen build recipes (use_figma patterns proven in kit builds)

All scripts: plain JS, `return` structured data + all created/mutated node IDs, `await figma.setCurrentPageAsync(page)` once at the top, load every font before touching text (`Geist Medium/Regular`, `Geist Mono Medium`, plus whatever the file reports).

## Plan contract recap

- Levels: `component | block | shell | screen`. This skill builds block, shell, screen.
- Statuses: `planned -> approved -> in-progress -> built`; also `blocked` (with `blockedOn`) and `flagged`. New builds start from `approved`; resume `in-progress` only after reconciling saved IDs and completed steps with Figma. All `dependsOn` must be `built`. Resolve recorded issues before restoring `blocked`/`flagged` to `approved` or `in-progress` as appropriate, retaining partial work and approvals. Write `in-progress` before mutations; persist IDs and progress after each logical step. Missing variants, responsive behavior, or approvals prevent `built`; record them as `blocked` with `blockedOn`. Interrupted work stays `in-progress`.
- `kitMatch` on a unit names the kit set and setId resolved at scan time; re-verify the setId resolves in the target file before instancing (copies preserve IDs, but confirm).
- `measure` on a unit is the capture recipe (routes, rootSelector, states); `captures` and `measurements` are empty until this skill fills them at build time. Prefer headless capture (CDP) so screenshots land on disk, not in context; dark via the app's own toggle or the `dark` class on `<html>`.

## 1. Instancing a kit set

Build `requestedProps` from the source and verified kit axes, including any verified defaults. Preserve property/value casing. Match structured properties rather than a display-name string:

```js
const set = await figma.getNodeByIdAsync(setId);
if (!set || set.type !== 'COMPONENT_SET') {
  throw new Error(`Expected component set: ${setId}`);
}
const matches = set.children.filter(child => {
  if (child.type !== 'COMPONENT') return false;
  const props = child.variantProperties;
  return props && Object.keys(props).length === Object.keys(requestedProps).length &&
    Object.entries(requestedProps).every(([key, value]) => props[key] === value);
});
if (matches.length !== 1) {
  throw new Error(`Expected one variant in ${setId}; found ${matches.length}`);
}
const inst = matches[0].createInstance();
parent.appendChild(inst);
```

If validation fails, record the requested properties and missing or ambiguous match as a blocking issue in the plan. Do not instantiate an arbitrary fallback or rebuild the primitive locally.

## 2. Instance overrides

- Helper: match prop keys by prefix (`Object.keys(props).find(k => k===p || k.startsWith(p+'#'))`) then `setProperties`.
- CRITICAL: `setProperties` invalidates previously found node handles in that instance tree. Re-run `findAllWithCriteria` after each mutation; never batch stale handles.
- SLOT children in instances: append instance, then re-fetch via `slot.children[slot.children.length-1]` before sizing or setting props. Slot children can also be removed per instance.
- Nested button labels: find the Button instance, patch its `label#...` key.

## 3. Block component, fully bound

- `figma.createComponent()`, layoutMode, `resize(w,h)` BEFORE sizing modes, primary FIXED / counter AUTO as the DOM dictates.
- `setBoundVariable` for itemSpacing, all four paddings, all four radii, minHeight: targets are `pro/space/*` and `pro/radius/*` (the pro indirection layer carries per-style density; raw Tailwind primitives would freeze one density and break style switching).
- Paints: `node.fills = [figma.variables.setBoundVariableForPaint({type:'SOLID', color:{r:0,g:0,b:0}}, 'color', modeVar)]` - it returns a NEW paint, capture it. Colors bind to Mode tokens.
- Text: create, `appendChild`, `textAutoResize='HEIGHT'`, `layoutSizingHorizontal='FILL'`, `setTextStyleIdAsync` to an existing bound style, bound fill.
- Control-next-to-text: wrapper frame, height BOUND to the text's line-height var, `counterAxisAlignItems='CENTER'`, control inside. Figma draws ink ~2px lower than Chrome; the wrapper matches the web relationship within ~1px.
- `strokeAlign='INSIDE'`; verify offsets against the measured border/layout model rather than assuming a fixed correction.

## 4. Props before combine (when a Block needs variants)

```js
const key = comp.addComponentProperty('label', 'TEXT', 'Label');
textNode.componentPropertyReferences = { characters: key };
wrapper.componentPropertyReferences = { visible: boolKey };
```

On the BASE component; clones inherit definitions and same-named props merge at `combineAsVariants`. Booleans controlling hidden-by-default parts: node invisible AND default false. Variant names preserve React prop/value casing, for example `screenSize=sm`.

## 5. Screen frames

- Naming: kit-maintenance uses `Large` and `Small` on the app page; customer copies use `<Name> - Large` and `<Name> - Small`.
- Large: frame 1440 wide, auto-layout matching measured desktop direction and order, gap and page padding bound to suitable `pro/space/*` tokens.
- Small: frame 375 wide, using the measured mobile layout and each Block's recorded responsive variant/overrides. Verify visibility, order, wrapping, sizing, and shell changes independently. Width alone is insufficient for discrete layout changes. Missing mobile behavior blocks completion and is reported to the owning unit.
- Shelled screens: instance the App Shell component first, place the route content in its content SLOT. Never build sidebar or topbar chrome ad hoc.
- Explicitly set the recorded source Style mode and Light Mode on both light test wrappers. For each width, clone the finished light frame for dark and set `setExplicitVariableModeForCollection(modeCollection, darkModeId)`. Preserve the source Style selection. Rebuild dark copies after any light edit; compare all four width/theme combinations.

## 6. Audits

- Record source Style and Light/Dark Mode IDs; resolve candidates in these modes and verify semantic purpose. Preserve original measurements. Approved substitutions in build notes must identify part/state/property, mode combination, original value, target token and resolved value, reason, code recommendation, and approval. Reuse prior approvals within scope.
- Resolve all used bindings in Light and Dark at the source Style mode, detecting missing targets/cycles. Compare numeric values and final RGBA channels against original measurements or approved targets; verify semantic token identity separately. Record rounding tolerance and require zero unexplained mismatches.

- Unbound paint audit: walk all non-instance nodes; flag SOLID fills/strokes without `boundVariables.color`.
- Geometry: compare `absoluteTransform` offsets against DOM `getBoundingClientRect` numbers at both widths and themes. Account only for measured border/layout behavior and documented effects of approved substitutions.
- Timed-out `use_figma` calls may still have applied; check state before retrying, never re-run blind.
