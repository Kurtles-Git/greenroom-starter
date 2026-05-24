---
name: greenroom-mvp-preservation
description: Use when modifying the Greenroom starter repo. Preserve the existing MVP structure, visual language, routes, and product feel. Only change UI where needed to solve the selected settlement workflow slice.
---

# Greenroom MVP Preservation Skill

## Purpose

This prototype must improve the existing Greenroom MVP, not replace it.

The case study asks for one focused product slice. The selected slice is:

**Settlement Trust Layer for complex Vs deals with recoup and expense-cap ambiguity.**

## Core rule

Preserve the existing app.

Do not redesign:
- global navigation
- app shell
- route structure
- typography system
- theme
- general dashboard layout
- unrelated pages
- show list pages
- reports pages
- artist pages

Only modify the settlement workflow where necessary.

Primary target route:
- `/shows/[id]/settle`

Secondary target files only if needed:
- `lib/dealMath.ts`
- `lib/queries.ts`
- settlement-related components
- new settlement-specific helper files

## Product goal

The current MVP breaks down when a settlement involves a complex Vs deal with ambiguous recoup treatment.

Improve that broken moment by adding:
1. Deal note interpretation.
2. Structured vs free-text comparison.
3. Ambiguity flags.
4. Scenario comparison.
5. Human confirmation.
6. Explainable settlement statement.
7. Optional Recovery Mode handoff.

## UI rule

Keep the original Greenroom UI as the base.

Allowed UI changes:
- Add cards inside the existing settlement page.
- Add a compact trust panel.
- Add badges, warnings, and scenario comparison cards.
- Add subtle transitions.
- Improve spacing only inside the new settlement slice.
- Add micro-interactions to new buttons/cards.

Not allowed:
- Full page redesign.
- New landing page.
- New marketing-style hero page.
- Unrelated animations across the app.
- Large visual theme changes.
- Replacing Greenroom’s interface with a new aesthetic.
- Adding Lenis or locomotive-scroll unless explicitly requested later and proven not to disturb the existing app.

## Motion rule

Use motion only to support understanding.

Good motion:
- reveal extracted terms
- highlight ambiguity
- animate scenario selection
- confirm assumption state
- show statement generated
- subtle Recovery Mode emphasis

Bad motion:
- parallax everywhere
- full-screen cinematic transitions
- scroll hijacking
- decorative animations that distract from settlement math

## AI rule

AI assists interpretation. It does not own the settlement.

Use AI or mock-AI for:
- extracting terms from deal notes
- flagging ambiguity
- drafting explanation copy

Use deterministic logic for:
- gross
- fees
- expenses
- recoups
- scenario math
- payout delta
- value at risk

Human confirms:
- final assumption
- settlement interpretation

## Offramp rule

Offramp is optional and secondary.

Greenroom remains the main product. Offramp only appears after high relationship risk is detected.

Do not say:
- “Open my app”
- “Check out Offramp”
- “I built another product”

Say:
- “Open Recovery Mode”
- “Generate recovery playbook”
- “Prepare agent response”

## Acceptance criteria

The final prototype should feel like the original Greenroom MVP gained a powerful settlement trust feature.

It should not feel like a separate new product was pasted on top.
