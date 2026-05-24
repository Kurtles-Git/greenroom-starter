---
name: greenroom-case-scope
description: Use when scoping Greenroom case study changes. Keep the solution narrow, product-led, and tied to the existing settlement workflow.
---

# Greenroom Case Scope Skill

## Goal

Keep the prototype focused on one high-value product slice inside the existing Greenroom MVP.

Selected slice:

**Settlement Trust Layer for complex Vs deals with recoup and expense-cap ambiguity.**

## Case study interpretation

The ask is not to redesign Greenroom or build a new product.

The ask is to:
1. Understand the current MVP.
2. Identify one broken or undercooked workflow.
3. Improve that slice with a working prototype.
4. Explain product judgment and trade-offs.

## Main product problem

The settlement worksheet fails when the deal structure is complex and the trusted agreement lives in free-text deal notes.

The deeper problem is trust:
- Mariana needs defensible math at 2 a.m.
- The tour manager needs line-by-line clarity.
- The agent needs provenance and itemisation.
- The GM needs fewer avoidable disputes.

## Hard scope

Build only:
- Vs deal trust assessment.
- Deal note interpretation.
- Structured vs prose comparison.
- Recoup and expense-cap ambiguity flagging.
- Two payout scenarios.
- Human confirmation.
- Explainable statement.
- Optional Recovery Mode handoff.

Do not build:
- full settlement engine
- generic AI chatbot
- whole app redesign
- new landing page
- payments
- live email sending
- full agent portal
- CRM

## Product quality bar

Every feature must answer at least one of these:
- What is ambiguous?
- Where did the term come from?
- What are the possible interpretations?
- What is the payout impact?
- What must Mariana confirm?
- How will this be explained to the agent or tour manager?
- Is the relationship at risk?

If a feature does not answer one of these, cut it.

## Final positioning

Use this framing:

"I kept the existing Greenroom MVP intact and focused on the settlement worksheet. I improved the moment where the MVP currently fails: complex Vs deals with ambiguous recoup treatment."

## Output expectation

After changes, report:
1. Files changed.
2. How the change fixes the selected slice.
3. What was intentionally not built.
4. What to test next.
