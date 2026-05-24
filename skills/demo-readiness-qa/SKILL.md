---
name: demo-readiness-qa
description: Use when reviewing the Greenroom prototype before demo submission, checking case-study alignment, existing MVP preservation, bugs, responsiveness, and whether the build feels above the AI baseline.
---

# Demo Readiness QA Skill

## Goal

Review the prototype like a senior evaluator before submission.

## Case-study checks

Confirm the prototype clearly shows:
- one narrow product slice
- existing Greenroom MVP is preserved
- `/shows/[id]/settle` is the main improved workflow
- Coastal Spell or equivalent high-risk Vs deal scenario
- free-text deal notes as a key source
- structured field mismatch or limitation
- ambiguous recoup treatment
- two payout scenarios
- $720 value at risk
- human confirmation
- explainable settlement statement
- Recovery Mode as optional follow-on

## Above-baseline checks

The prototype should not look like:
- a generic AI chatbot
- a generic calculator
- a dashboard reskin
- a full product redesign
- a separate Offramp demo

It should show:
- product judgment
- trust-aware design
- deterministic math
- AI-assisted extraction
- human-in-the-loop confirmation
- relationship-risk thinking

## MVP preservation checks

Confirm:
- global navigation is not redesigned
- app shell is not replaced
- unrelated pages are not redesigned
- route structure is intact
- original UI still feels recognizable
- new feature appears as a natural upgrade to the settlement page

## Functional QA

Check:
- settlement page renders without console errors
- Vs deal route shows the Trust Layer
- supported deal routes still work
- scenario math is correct
- Scenario A payout is 12285
- Scenario B payout is 11565
- value at risk is 720
- confirmation changes UI state
- settlement statement reflects selected assumption
- Offramp payload is generated correctly
- encoded URL is valid
- fallback Recovery Mode preview works

## UX QA

Check:
- desktop layout at 1440px
- laptop layout at 1280px
- mobile layout at 375px
- no horizontal overflow
- clear focus states
- readable text contrast
- primary CTAs have hover/tap states
- motion is subtle and not excessive

## Copy QA

Avoid:
- "AI-powered magic"
- "revolutionary"
- "perfect settlement"
- "legally correct"

Use:
- "possible interpretation"
- "needs confirmation"
- "verified assumption"
- "relationship risk"
- "value at risk"

## Final report format

When finished, report:
1. Files changed.
2. Passes.
3. Issues fixed.
4. Remaining risks.
5. Final demo route.
6. Suggested Loom path.
