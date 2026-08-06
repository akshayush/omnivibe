---
title: "Agent evals and traces: prove the loop before you scale it"
date: "2026-08-07"
excerpt: "Architecture is cheap to draw. Trust comes from traces you can read and evals that catch the failures that matter—here is a practical scorecard."
readTime: "8 min read"
---

Yesterday we chose **one loop first**, and split only when traces force the seam. Today’s question is the one that decides whether that loop is shippable:

> How do we know the agent did the right work—not just that it finished talking?

Demos pass when the model sounds confident. Production passes when you can **replay the run**, **score the outcome**, and **catch the failure modes that hurt users**. That is evals and traces. Without them, “agentic” is theater.

## Two eval layers

Most teams score the wrong thing. They grade prose quality, or they grade every tool call in isolation, and miss the job.

You need **both** layers:

```two-evals
```

| Layer | Question | Passes when | Fails when |
| --- | --- | --- | --- |
| **End-to-end** | Did we deliver the user outcome? | Final artifact is correct, complete, and safe enough to hand off | Pretty steps, wrong brief |
| **Contract / step** | Did each owned step keep its promise? | Tools returned usable data; checks ran; handoffs matched schema | Silent skips, poisoned context, skipped review |

End-to-end without contracts hides *where* it broke.  
Contracts without end-to-end celebrate green steps that still ship a bad result.

**Builder rule:** One success metric for the job. Separate checks for the seams that usually lie.

## What a useful trace looks like

A log dump is not a trace. A useful trace answers, in one screen:

1. **Goal** — one sentence the run was trying to finish  
2. **Plan** — the checkable steps it committed to  
3. **Acts** — tool calls with inputs/outputs (or redacted summaries)  
4. **Checks** — what it verified before continuing  
5. **Recoveries** — retries, degradations, escalations  
6. **Stop** — done, blocked on human, or failed with reason  

```trace
```

If you cannot explain a run to a colleague from the trace alone, you cannot evaluate it either. Evals sit on top of traces; they do not replace them.

### Minimum fields worth logging

- `run_id`, `goal`, `started_at`, `finished_at`
- Each turn: `phase` (`plan` / `act` / `check` / `gate` / `done`), `tool`, `status`, `ms`
- For acts: argument summary + result summary (not only “success: true”)
- For checks: what was asserted and against which source
- For writes: whether approval was required and whether it was granted

Skip vanity: token counts without outcome scores teach you nothing about trust.

## A scorecard you can steal

Start narrow. Five metrics beat fifty dashboards.

```scorecard
```

| Metric | What it means | Example pass |
| --- | --- | --- |
| **Task completed** | Reached a real stop condition for the goal | Brief ready *or* cleanly blocked on approval |
| **Grounded claims** | Numbers/facts match sources the agent fetched | 4 / 4 claims verified |
| **Tool recovery** | Transient failures degraded or retried on purpose | 1 / 1 CRM timeouts handled |
| **Unsafe writes** | No side effects without the gate you defined | 0 unapproved posts / sends / updates |
| **Wall clock / cost** | Latency and spend stay inside the budget you named | Under the agreed SLA |

Notice what is missing: “sounded smart,” “used many tools,” “called the orchestrator.” Those are not outcomes.

### How to score a run in practice

1. **Define done before the first tool call.** “Open a summary thread with verified failure counts” is evaluable. “Be helpful about payments” is not.
2. **Attach sources to claims.** If the draft says “91 insufficient_funds,” the trace must show where 91 came from.
3. **Separate optional from required.** CRM tier enrichment can degrade; inventing a count cannot.
4. **Treat approval as a first-class status.** Stopped at a gate can be a pass. Silent send is a fail.
5. **Re-run the same goal on a fixed fixture set.** One lucky production run is an anecdote, not an eval harness.

## Same goal, scored two ways

**Goal:** “Reconcile yesterday’s payment failures and open one summary thread.”

**End-to-end pass**

- Counts match the payments query
- Top causes are ranked correctly
- Draft is ready for a human
- No Slack post without approval

**Contract checks along the way**

- `payments.list` returned a usable schema
- Missing `customer_id` rows were flagged, not dropped quietly
- CRM timeout → retry with batching → continue without tiers if needed
- `verify.claims` ran before the write gate

```loop
```

That is the loop from earlier notes—with evidence attached to each phase.

## Common traps

**“The model said the task succeeded.”**  
Self-grades are not evals. Score against tools, fixtures, and human review samples.

**“We measure tool-call success rate.”**  
A 100% tool success rate can still ship a wrong summary. Outcome first; tools second.

**“We’ll add evals after we ship the swarm.”**  
Multi-agent multiplies surfaces. If you cannot score one loop, you cannot score five.

**“Traces are for debugging only.”**  
Traces are your dataset. Offline eval, regression packs, and incident review all start there.

**“Latency is the product metric.”**  
Fast and wrong still fails. Keep wall clock on the scorecard—never alone.

## What good looks like

Ship this progression:

1. **Instrument one loop** — every plan / act / check / gate turn lands in a structured trace.
2. **Name five metrics** — completion, grounding, recovery, write safety, cost/latency.
3. **Build a tiny fixture pack** — 10–30 goals with known answers (including messy inputs).
4. **Fail closed on writes** — approval gates are scored, not skipped for the demo.
5. **Only then scale** — split agents or add tools when traces show a repeated, named failure.

Checklist before you call an agent “reliable”:

- Can a human replay the last bad run in under two minutes?
- Is “done” defined without vibes?
- Which claims must be grounded, and how do we check them?
- What is allowed to degrade vs what must abort?
- Which actions require a human, and does the scorecard punish skipping that gate?

If those answers are fuzzy, you do not need a bigger model. You need a clearer eval.

## Try this

Pick one agent workflow you already run (or want to). On one page, write:

1. **Goal** in one sentence  
2. **Stop conditions** — success, safe block, hard fail  
3. **Five scorecard rows** — metric, how you measure, pass threshold  
4. **Trace fields** you will log on every turn  

Then run the same goal three times on fixed inputs. Keep only the metrics that catch a real mistake at least once.

Architecture decides the shape of the system.  
**Evals and traces decide whether you should trust it.**
