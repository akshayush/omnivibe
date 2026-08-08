---
title: "Give every agent a tool budget before it starts"
date: "2026-08-08"
excerpt: "Unlimited tool calls look powerful in demos and expensive in production—here is how to set a budget that still ships work."
readTime: "7 min read"
---

Yesterday we talked about **evals and traces**—proving the loop before you scale it. Today is the constraint that makes those traces stay affordable:

> How many tools, how much time, and how much spend does this run get before it must stop?

Demos love unlimited retries. Production hates them. An agent that can call tools forever will eventually find a way to loop, burn tokens, and still miss the goal. A **tool budget** is not pessimism. It is how you keep the loop honest.

## What a tool budget actually is

A budget is three hard caps you set **before the first act**:

| Cap | Question it answers | Example |
| --- | --- | --- |
| **Tool calls** | How many external acts can this run take? | Max 12 tool calls |
| **Wall-clock** | How long may the run stay open? | Max 90 seconds |
| **Spend** | What is the money ceiling for model + tools? | Max $0.40 / run |

Soft guidance in the prompt (“try not to overuse tools”) is not a budget. If the runtime cannot enforce it, it is vibes.

```loop
```

## Cheap reads vs expensive writes

Not every tool call costs the same—in money or in blast radius.

| Kind | Examples | Budget posture |
| --- | --- | --- |
| **Cheap reads** | Search, fetch ticket, read docs, get status | Allow more; log aggressively |
| **Expensive reads** | Huge embeddings refresh, full CRM export | Cap tightly; cache results |
| **Writes** | Email, Slack post, CRM update, deploy | Fewest calls; gate irreversible ones |

**Builder rule:** Spend most of the budget on *finding* the answer. Spend almost none on *changing the world* until the draft is ready.

Separate counters help. A run might allow 10 reads and 2 writes. When the write counter hits zero, the agent must return a draft or escalate—not invent another “just one more update.”

## What to do when the budget is hit

Hitting a cap is not a crash. It is a **planned stop**. Design the degradation path up front:

1. **Stop new acts.** No more tool calls once any hard cap trips.
2. **Return the best partial.** A grounded draft with gaps labeled beats a silent hang.
3. **Say which cap fired.** `tool_calls`, `wall_clock`, or `spend`—so the trace is diagnosable.
4. **Escalate if the job needs a write you blocked.** Human gate or queued retry with a fresh budget.

| Cap hit | Good behavior | Bad behavior |
| --- | --- | --- |
| Tool calls | Summarize evidence so far; mark missing sources | Retry the same search in a loop |
| Wall-clock | Ship partial + next step | Keep planning until timeout kills the process |
| Spend | Fail closed on new model/tool spend | Quietly continue and surprise finance |

If your traces show the same tool failing three times, that is not “persistence.” That is a missing recovery policy eating the budget.

## A starter budget you can steal

For an internal research → draft agent (no irreversible writes):

| Cap | Starter value | Why |
| --- | --- | --- |
| Tool calls | 8–15 | Enough for retrieve → check → draft |
| Wall-clock | 60–120s | Users feel hangs before they feel thoroughness |
| Spend | Set from your p95 of good runs × 1.5 | Room for one retry, not ten |

For an agent that can send email or update CRM, cut **writes to 1–2** and put a human gate on anything irreversible—even if read budget is higher.

### How to tune without guessing

1. Trace 20 recent runs.
2. Note p50/p95 tool calls, seconds, and cost for *successful* runs.
3. Set caps slightly above p95 success—not above your worst failure spiral.
4. Alert when >20% of runs hit a cap; that means the job is under-scoped or tools are flaky.

## Checklist before the first act

1. One-sentence success criteria (what “done” means).
2. Numeric caps for tools, time, and spend.
3. Split read vs write allowances if writes exist.
4. Degradation behavior when each cap fires.
5. Trace fields: `caps`, `remaining`, `cap_hit` (if any).

Skip any of these and the demo will still clap. Production will invoice you later.

## Try this

Pick one live agent run and add hard caps: N tool calls, M seconds, $X. Log when each cap is hit.
