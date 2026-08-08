---
title: "Give every agent a tool budget before it starts"
date: "2026-08-08"
excerpt: "Unlimited tool calls look powerful in demos and expensive in production—here is how to set a budget that still ships work."
readTime: "3 min read"
---

## Why this matters today

Shipping AI systems is less about clever prompts and more about **operating constraints**. Today we focus on: **Give every agent a tool budget before it starts**.

When teams skip this, demos look fine and production quietly burns money, trust, or both.

```loop
```

## The practical shape

1. Define max tool calls, wall-clock, and spend before the first act
2. Separate cheap reads from expensive writes
3. Degrade gracefully when the budget is hit instead of looping forever

| Move | What good looks like | What to avoid |
| --- | --- | --- |
| Define the job | One success sentence | Vague “be helpful” goals |
| Bound the loop | Caps on tools, time, spend | Unlimited retries |
| Prove it | Traces + a small eval set | Vibes-only launches |

## Builder notes

- Keep the **goal** and **stop conditions** visible in every run.
- Prefer **checks** that can fail closed over hopeful wording in the prompt.
- If a step does not move the success metric, delete it.

## Try this

Pick one live agent run and add hard caps: N tool calls, M seconds, $X. Log when each cap is hit.
