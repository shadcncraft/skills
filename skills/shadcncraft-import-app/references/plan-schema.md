# Plan artifacts and contract (version 2)

Write `import-plan.md` and `import-plan.json` to the session's project and deliver both. The markdown summarizes the same revision: app profile, confirmed run mode, style evidence, token sync, dependency-ordered unit table, hygiene, substitution proposals, open questions, approvals, and remaining work. Do not mirror externally.

## JSON shape

The following is an illustrative initial plan, not an approved build input. Null IDs and fingerprints must be resolved where required before approval/build. Populate values from evidence; never copy example identities into a real plan.

```json
{
  "version": 2,
  "revision": 1,
  "app": {
    "name": "example-app",
    "repo": "/path/to/repo",
    "framework": "next-app-router",
    "scannedAt": "2026-09-11T00:00:00Z",
    "runMode": "customer-copy",
    "sourceRevision": { "commit": null, "dirty": null },
    "styleMatch": {
      "style": null,
      "confidence": "unknown",
      "candidates": [],
      "evidence": [],
      "modeId": null,
      "modeCollectionId": null,
      "lightModeId": null,
      "darkModeId": null,
      "styleCollectionId": null
    },
    "shell": false,
    "figma": { "fileKey": null, "targetFrame": null },
    "manifest": { "manifestVersion": 1, "kitVersion": "v3.4", "generatedFrom": "bundled historical index", "warnings": [] }
  },
  "tokenSync": { "status": "unverified", "tolerance": null, "drift": [] },
  "units": [
    {
      "id": "C1",
      "level": "component",
      "name": "CustomControl",
      "source": ["components/custom-control.tsx"],
      "exports": ["CustomControl"],
      "dependsOn": [],
      "classification": "custom-build",
      "kitMatch": null,
      "size": "S",
      "status": "planned",
      "blockedOn": null,
      "sourceFingerprint": null,
      "measure": { "routes": ["/example"], "rootSelector": null, "boundary": "CustomControl", "states": ["default"], "widths": [1440, 375], "themes": ["light", "dark"] },
      "captures": [],
      "measurements": null,
      "buildNotesPath": null,
      "approvalIds": [],
      "substitutionIds": [],
      "notes": ""
    }
  ],
  "approvals": [],
  "substitutions": [],
  "hygiene": [],
  "openQuestions": [],
  "history": []
}
```

## Fields and allowed values

- `runMode`: `customer-copy | kit-maintenance`. Confirm against the user's intent for this file, not its name.
- `styleMatch`: `style` and `modeId` identify the selected live Style mode; `styleCollectionId`, `modeCollectionId`, `lightModeId`, and `darkModeId` identify its collections and theme modes. Confidence: `high | medium | low | unknown`. Record candidate names, evidence, and any explicit user selection. Null selection is valid for planning, not a ready build. Figma IDs always come from the target file.
- `tokenSync.status`: `in-sync | drifted | unverified`. Tolerance records numeric limits and units for scalar values and normalized RGBA channels. Each drift entry records token, property, Style/theme mode, source and resolved Figma value, type (`value-mismatch | missing-in-figma | missing-in-code | unresolved`), and recommendation. Do not compare unresolved aliases or unselected modes as if verified.
- Unit `level`: `component | block | shell | screen`. `classification`: `custom-build | kit-instance | pro-match | local-recommended | out-of-scope | blocked`. `status`: `planned | approved | in-progress | built | blocked | flagged | removed`. Size: `S | M | L`.
- Out-of-scope modules without a build level belong in the scan notes rather than executable units. Any retained out-of-scope unit is excluded from build scheduling. Put accepted placeholder work in the owning executable unit.
- `kitMatch`: null or `{fileKey, nodeId, setId, pageId, type, name, variantProperties, verifiedAt, evidence}`. `type` is `COMPONENT_SET | COMPONENT`. For a set, `setId` equals `nodeId`; for a standalone component it is null. `variantProperties` preserves exact prop/value casing. Evidence identifies the verified family/description and live type. Builders may only use matches verified in the user's target file, and recheck before mutation. Never fill IDs by guessing or equate mere ID resolution with identity.
- `blockedOn`: null or an array of `{kind, unitId, detail, remedy}`. Kind: `dependency | missing-kit-piece | missing-variant | approval | style | source | qa`. `unitId` is null for external work such as an official component routed to new-component. Such work is not a dangling `dependsOn` ID.
- `sourceFingerprint`: `{algorithm: "sha256", files: [{path, sha256}], aggregate}`. Hash file bytes, using sorted repository-relative paths and hashes to produce the aggregate. Include source files plus relevant transitive imports, theme CSS, layout, assets, and configuration. Record absent/unresolved inputs explicitly in open questions; never fabricate a hash. Git commit is supplementary: file hashes must catch uncommitted changes and work outside Git.
- `measure` describes future capture, never measured results. Provide routes and a stable root selector or component boundary; unknown selectors stay null. Record required state, responsive, auth/demo, and data setup in notes. Build-time screenshots cover both widths and themes. `captures` and `measurements` remain empty for a new plan unit.
- `buildNotesPath` points to persistent notes recording node/variable/style IDs, modes, completed steps, approvals, substitutions, responsive mappings, and QA results. Preserve it and all build records during rescans.
- Each `approvals` record: `{id, kind, status, recordedAt, planRevision, unitIds, fingerprintByUnit, scope, evidence}`. Kind: `plan | variable | shared-master | substitution | placeholder`. Status: `pending | approved | rejected | invalidated`. Evidence identifies the actual user approval; a proposal has no approval evidence. Scope describes the exact agreed operation. Only explicit approval sets `approved`.
- Each `substitutions` record: `{id, unitId, part, state, property, styleModeId, themeModeId, sourceValue, targetToken, targetResolvedValue, reason, visualImpact, recommend, approvalId}`. One record per applicable mode combination. Preserve source measurements. Unknown build-time values remain null and cannot form an approved target. Plan approval does not authorize substitutions, variables, or shared-master changes unless separately and explicitly covered.
- `hygiene` entries record file/unit, issue, found value, recommendation, and related substitution/approval IDs. Proposed Figma actions remain proposals until approved.
- `history` records scan revisions, changed/removed unit IDs, prior statuses, invalidations, and reasons. It must not claim actions or approvals that did not occur.

## Validation before handoff

1. Validate JSON and version; require unique unit, approval, and substitution IDs. Check every reference resolves and each mode ID belongs to its recorded live collection.
2. `dependsOn` contains executable unit IDs only, no self-reference, cycles, removed records, or out-of-scope units. External prerequisites belong in `blockedOn`. Topologically sort; level order is only a tie-breaker where dependency edges permit it.
3. A ready unit has confirmed run mode, target, source Style/theme selections, verified source fingerprint, measurement targets, applicable approvals, and all dependencies `built`. A plan may be delivered with unresolved fields, but affected units cannot be declared ready.
4. New units start `planned`, unless blocked by a known prerequisite. Explicit plan approval changes eligible `planned` units to `approved`; it never blanket-overwrites blocked, flagged, removed, in-progress, or built statuses.
5. Builders set `in-progress` before mutations and persist progress. `built` means required work and QA are complete with no unexplained mismatches or outstanding approvals. Verified existing kit instances may be marked `built` as a reuse-only unit only after required variant availability is verified and that reuse is recorded. No creation is implied.
6. Markdown and JSON must show the same revision, statuses, approvals, and open questions.

## Rescan and resume

- Load the existing plan before scanning. Preserve stable IDs by source path plus export/role and existing history. For renames, splits, or merges, use verified evidence; do not guess correspondence or reuse removed IDs. New units get fresh IDs. Keep removed records with `removed`, and block or update their dependents explicitly.
- Compute fingerprints and compare source/config/assets, dependency edges, target, mode choices, and approved scope. Reuse unchanged build records and approvals. Do not reset captures, measurements, progress, or notes for unchanged units.
- When inputs change, flag affected units for revalidation and traverse reverse dependency edges to flag/block dependents. Preserve prior node IDs, captures, and QA as historical evidence, clearly marked stale. Invalidate affected approvals when their scope or recorded inputs no longer match, without discarding unrelated approvals. A changed `built` unit cannot remain silently reusable.
- Record all changes in history. Revalidation must establish what remains reusable and what requires rebuilding, fresh capture, or renewed approval. Restore a flagged/blocked unit to `approved` if unstarted or `in-progress` if partial work exists only after its blocker is resolved. Completion requires fresh relevant QA, not a status edit alone.
- Resume verified `in-progress` work before starting the next ready `approved` unit. Reconcile Figma nodes against saved IDs and completed steps before writes. Do not clone completed work again. Verify dependencies, source fingerprints, target and mode choices first.
- For legacy version 1 plans, preserve their original file as a local backup and migrate fields explicitly. Keep IDs and historical build records; missing fingerprints, approvals, or mode selections are unknown, never inferred as verified. Flag previously built/active units for revalidation until missing evidence is established. Then save version 2 and an updated markdown summary.
