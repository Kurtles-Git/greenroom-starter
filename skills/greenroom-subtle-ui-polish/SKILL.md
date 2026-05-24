---
name: greenroom-subtle-ui-polish
description: Use when polishing only the new settlement trust components while preserving the existing Greenroom MVP UI. This replaces broad Awwwards-style redesign instructions.
---

# Greenroom Subtle UI Polish Skill

## Goal

Improve the perceived quality of the new settlement trust slice without redesigning the whole Greenroom app.

The interface should feel more polished, but still clearly belong to the existing MVP.

## Use

Use this Skill only for:
- new settlement trust cards
- scenario comparison cards
- confirmation interactions
- statement preview
- Recovery Mode card
- small spacing and responsive fixes inside `/shows/[id]/settle`

Do not use this Skill to redesign unrelated routes.

## Visual rule

Match the existing Greenroom UI.

Allowed:
- better spacing inside new sections
- clear visual hierarchy
- refined borders and shadows that match existing UI
- badges for risk and source
- small financial calculation panels
- hover/focus/tap states
- subtle Framer Motion transitions

Avoid:
- new design language
- dramatic gradients
- full-screen hero sections
- parallax
- scroll hijacking
- broad theme changes
- global CSS rewrites
- Awwwards landing page energy

## Motion rule

Motion should help the user understand state changes.

Good:
- fade in extracted terms
- slight slide up for new cards
- selected scenario state transition
- confirmation success transition
- small pulse for high-risk warning
- copy feedback on statement copy button

Bad:
- decorative motion unrelated to settlement
- animations across the full app
- slow transitions
- hijacked scrolling
- flashy page transitions

## Responsiveness

Desktop:
- side-by-side scenarios
- compact risk summary
- readable statement preview

Mobile:
- stacked cards
- no horizontal overflow
- primary action visible
- tap targets at least 44px

## Accessibility

- visible focus states
- readable contrast
- no color-only risk communication
- semantic headings
- reduced-motion should still be usable

## Copy tone

Use operational copy:
- "Ambiguity detected"
- "Two payout outcomes are plausible"
- "Human confirmation required"
- "Statement reflects selected assumption"

Avoid hype:
- "AI magic"
- "revolutionary"
- "perfect settlement"

## Acceptance criteria

The new feature should feel:
- cleaner
- more confident
- more usable
- more trustworthy

But the app should still feel like Greenroom.
