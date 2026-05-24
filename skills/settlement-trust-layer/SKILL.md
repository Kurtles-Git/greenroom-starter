---
name: settlement-trust-layer
description: Use when building deal interpretation, settlement calculation, ambiguity detection, scenario comparison, explainable statements, or audit trail functionality for Greenroom settlement workflows.
---

# Settlement Trust Layer Skill

## Goal

Build the Greenroom settlement trust workflow for a focused Vs deal scenario.

The system should not pretend ambiguous deal terms have one obvious answer. It should expose the ambiguity, calculate both interpretations, and ask the human to confirm.

## Hero scenario constants

Use Coastal Spell as the hero example.

- Deal type: Vs deal.
- Guarantee: 5000.
- Percentage: 80%.
- Basis: net after expenses.
- Gross box office: 19840.
- Fees: 1984.
- Expense cap: 2500.
- Marketing recoup: 900.
- Ambiguous phrase: "expenses capped at $2,500, marketing recoup of $900 against gross."
- Scenario A: recoup inside expense cap.
- Scenario A artist payout: 12285.
- Scenario B: recoup outside expense cap.
- Scenario B artist payout: 11565.
- Value at risk: 720.

## Calculation logic

Use deterministic code for all math.

Scenario A:
- Net = gross - fees - capped expenses.
- Net = 19840 - 1984 - 2500 = 15356.
- Artist percentage = 15356 * 0.8 = 12284.8.
- Display rounded artist payout as 12285.
- Final artist payout = max(5000, 12285) = 12285.

Scenario B:
- Net = gross - fees - marketing recoup - capped expenses.
- Net = 19840 - 1984 - 900 - 2500 = 14456.
- Artist percentage = 14456 * 0.8 = 11564.8.
- Display rounded artist payout as 11565.
- Final artist payout = max(5000, 11565) = 11565.

Value at risk:
- 12285 - 11565 = 720.

## Required outputs

Create functions or structured objects that return:
- extracted deal terms
- source labels
- confidence level
- risk flags
- scenario calculations
- recommended assumption
- selected or confirmed assumption state
- settlement statement copy
- audit events
- recovery payload

## Mock AI rules

If no AI API is connected, implement deterministic mock AI.

The mock AI may parse keywords from `dealNotesFreetext`, but it must return structured output that looks like a real extraction result.

Use labels:
- "Extracted from deal notes"
- "Matches structured field"
- "Structured field missing"
- "Ambiguous wording"
- "Needs human confirmation"

## Trust language

Use:
- Verified
- Needs confirmation
- Ambiguous
- Human confirmed
- Source: deal notes
- Source: structured field
- Source: settlement record

Avoid:
- "This is the correct interpretation."
- "AI has decided."
- "Legally valid."

Say:
- "This is a possible interpretation."
- "This assumption needs confirmation."
- "The math below reflects the selected assumption."

## Component names

Prefer:
- `DealTrustPanel`
- `DealTermExtractionCard`
- `TrustFlagList`
- `ScenarioComparison`
- `AssumptionConfirmation`
- `SettlementStatementPreview`
- `AuditTrail`

## UI requirements

- Match the existing Greenroom UI style.
- Show two scenarios side by side on desktop.
- Stack scenarios on mobile.
- Make value at risk clear.
- Do not hide the math.
- Provide an agent-facing statement preview.
- Show human confirmation visibly.

## Acceptance criteria

A reviewer should understand in under 60 seconds:
1. The deal is a Vs deal.
2. The legacy tool fails or is insufficient.
3. The deal note has ambiguous recoup treatment.
4. There are two plausible payout outcomes.
5. The difference is $720.
6. Mariana must confirm the assumption.
7. Greenroom then creates a defensible settlement statement.
