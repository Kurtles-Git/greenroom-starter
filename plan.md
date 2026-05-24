## Goal

Make the Offramp handoff section actually render on the Coastal Spell demo and expose all three integration patterns from the Offramp docs (encoded JSON, flat query params, live POST).

## Changes

### 1. Force-trigger Recovery cards on Coastal Spell

`src/components/settlement/RecoveryModeCard.tsx` and `src/components/settlement/RecoveryPlaybookPreview.tsx` both gate render on `assessment.relationshipRisk.level === "high" && assessment.valueAtRisk > 0 && assessment.ambiguous`. On the seed deal, `ambiguous` is false because the cap regex requires the word "at", so both cards return `null` — that's the empty space the user saw.

Fix: pass an explicit `forceTrigger` prop from `TrustLayerBlock` in `src/routes/shows.$id.settle.tsx` when `data.show.id === "show_coastal_spell_dispute"`, and OR it into the existing `isTriggered` check in both card components. Leaves the heuristic intact for non-hero shows.

### 2. Add a flat query-param deep link builder

`src/lib/settlementTrust.ts` already has `buildOfframpRecoveryUrl(payload)` for the base64-encoded JSON form. Add a sibling:

```ts
export function buildOfframpRecoveryFlatUrl(payload: RecoveryPayload): string
```

It maps the top-level scalar fields of `RecoveryPayload` (`risk_type`, `stakeholder_type`, `stakeholder_name`, `company_or_account`, `issue_summary`, `value_at_risk`, `currency`, `urgency`, `relationship_risk`, `source_app`, `source_reference_id`) into `URLSearchParams` and skips the nested `scenario_a` / `scenario_b` / `issue_details` objects (those can't be expressed as flat params and the docs URL in the screenshot omits them too).

### 3. Surface the flat link in the Recovery Mode card

Update `RecoveryModeCard.tsx`:

- Accept an additional `recoveryFlatUrl: string` prop.
- Keep the primary rose CTA ("Open Recovery Mode") pointing at the existing base64 `recoveryUrl`.
- Add a secondary, lower-emphasis link next to it: "Open with query params" → `recoveryFlatUrl`, opens in a new tab. Same icon treatment as the primary, but ghost/outline styling so the encoded-JSON path stays the recommended default.

Wire the new URL in `TrustLayerBlock` (`src/routes/shows.$id.settle.tsx`) via `useMemo(() => buildOfframpRecoveryFlatUrl(recoveryPayload), [recoveryPayload])`.

### 4. No changes to

- `src/lib/recovery.functions.ts` — the POST handoff is already done.
- `RecoveryPlaybookPreview.tsx` API call path — only the trigger gating changes.
- Math, audit trail, statement preview, navigation, theme.

## Verification

1. Visit `/shows/show_coastal_spell_dispute/settle` → confirm the rose "High relationship risk" card and the "Recovery playbook preview" card both render between the Statement preview and the Audit trail.
2. Click "Open Recovery Mode" → opens `thatofframp.com/recovery/demo?payload=<base64>` in a new tab (unchanged).
3. Click the new "Open with query params" link → opens `thatofframp.com/recovery/demo?risk_type=…&stakeholder_type=…&value_at_risk=720&…` in a new tab; URL inspect matches the doc screenshot shape.
4. Click "Generate live playbook" → live diagnosis + suggested message render inline (unchanged).
5. Spot-check another show route (e.g. a non-disputed one) — Recovery cards do NOT render there.
