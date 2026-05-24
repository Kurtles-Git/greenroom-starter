---
name: offramp-recovery-handoff
description: Use when adding the Offramp Recovery Mode handoff, recovery payload, URL encoding, dispute playbook preview, or relationship-risk UI inside the Greenroom prototype.
---

# Offramp Recovery Handoff Skill

## Goal

Add Offramp as a strategic recovery intelligence layer after Greenroom detects high settlement relationship risk.

Greenroom remains the main product. Offramp is a supporting handoff.

## Positioning

Do not position Offramp as a separate product demo.

Use this framing:

"Greenroom detects settlement trust risk. Recovery Mode uses the structured risk event to prepare a relationship-preserving response."

## Trigger

Only show Offramp handoff when:
- dispute risk is high
- value at risk is material
- there is ambiguity between two payout interpretations
- the affected stakeholder is an agent, tour manager, artist manager, or artist

## Greenroom handles

- settlement interpretation
- source extraction
- scenario math
- value at risk
- relationship risk score
- settlement statement
- audit trail

## Offramp handles

- recovery playbook
- stakeholder-specific message
- concession options
- escalation path
- documentation checklist
- follow-up strategy

## Required payload

Generate this payload shape:

```json
{
  "risk_type": "settlement_dispute",
  "stakeholder_type": "agent",
  "stakeholder_name": "Sarah Kim",
  "company_or_account": "WME",
  "issue_summary": "Marketing recoup treatment unclear",
  "issue_details": "The deal can be interpreted as either including the marketing recoup inside the expense cap or deducting it separately.",
  "value_at_risk": 720,
  "currency": "USD",
  "urgency": "high",
  "relationship_risk": "high",
  "source_app": "greenroom_case_demo",
  "source_reference_id": "crescent-coastal-spell",
  "scenario_a": {
    "label": "Recoup inside expense cap",
    "outcome_value": 12285,
    "description": "Artist payout if the recoup is included within the capped expenses."
  },
  "scenario_b": {
    "label": "Recoup outside expense cap",
    "outcome_value": 11565,
    "description": "Artist payout if the recoup is deducted separately."
  }
}
```

## URL format

Encode the payload as Base64 JSON and open:

`https://thatofframp.com/recovery/demo?payload=BASE64_ENCODED_JSON`

Use safe browser-compatible Base64 encoding.

## Recovery Mode UI

Add a small secondary card or panel with:
- "High relationship risk detected"
- Value at risk
- Stakeholder
- Why this may escalate
- Recommended first action
- Preview of playbook sections
- CTA: "Open Recovery Mode"

Do not use CTA copy like:
- "Open my app"
- "Go to Offramp"
- "Check out my product"

Better CTA:
- "Open Recovery Mode"
- "Generate recovery playbook"
- "Prepare agent response"

## Demo fallback

If the external handoff is not ready, keep the experience working by showing an in-app Recovery Mode preview with the same payload and a generated playbook.

## Acceptance criteria

The handoff feels like a natural escalation from settlement trust risk, not a promotional redirect.

A reviewer should understand:
1. Greenroom detected the risk.
2. Recovery Mode receives structured context.
3. The recovery layer helps preserve the relationship.
4. Recovery Mode does not replace Greenroom.
