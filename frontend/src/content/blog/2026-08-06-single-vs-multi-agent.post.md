---
title: "Single agent vs multi-agent: when one loop is enough"
date: "2026-08-06"
excerpt: "Multi-agent looks advanced. One well-scoped loop often ships faster, fails clearer, and is easier to trust—here is how to choose."
readTime: "7 min read"
---

Yesterday we separated **LLMs**, **agents**, and **agentic systems**. Today’s question is the one teams ask next:

> Do we need many agents—or is one loop enough?

Multi-agent demos feel powerful. In production, every extra agent adds prompts, tools, handoffs, failure modes, and eval surface area. The disciplined move is usually: **start with a single agent**, and split only when one loop is clearly the bottleneck.

## Two shapes

### Single agent — one loop

One model (or one agent runtime) owns the goal. It plans, calls tools, checks progress, and stops.

```single
```

**Best when:**

- The goal fits in one sentence
- The same tool belt is enough for every step
- One memory stream can hold the task state
- You can define “done” without a committee

### Multi-agent — many roles

Specialists hand work to each other (researcher → worker → reviewer), usually under an orchestrator and shared state.

```multi
```

**Best when:**

- Steps need different skills, models, or permissions
- You want isolation so one bad tool call does not poison the whole run
- Work can run in parallel with clear contracts between roles
- Review / policy must be a separate authority, not a self-check

## The real difference

It is not “smarter” vs “dumber.” It is **ownership**.

| | Single agent | Multi-agent |
| --- | --- | --- |
| **Owns the goal** | One loop | Orchestrator + specialists |
| **Context** | One running memory | Shared state + handoff payloads |
| **Failure** | One place to debug | Many places + contract bugs |
| **Cost to ship** | Lower | Higher (prompts, routing, evals) |
| **Looks impressive** | Sometimes less | Often more |
| **Usually right first** | Yes | Only when forced |

A single agent that finishes the job beats a multi-agent graph that spends tokens arguing with itself.

## When one loop is enough

Use a **single agent** if most of these are true:

1. **One user-facing outcome** — “triage this ticket,” “draft the weekly report,” “reconcile these three invoices.”
2. **One permission boundary** — the agent can hold the same read/write rights for the whole task.
3. **Linear or lightly branching work** — retries and tool choice matter more than specialist roles.
4. **You can eval end-to-end** — success is “correct final artifact,” not “each role performed beautifully.”
5. **Latency and cost matter** — every extra agent turn is another model call, another chance to drift.

Classic single-loop fits:

- Support macros (fetch context → draft reply → optional send)
- Internal research with a fixed tool set
- Codefix agents scoped to one repo and one PR
- Data cleanup jobs with validate-then-write

```loop
```

If that picture describes your workflow, stay there. Depth beats width.

## When multi-agent earns its keep

Split into multiple agents when **one brain with one tool belt becomes the problem**:

### 1. Conflicting skills or models

A cheap/fast model scrapes and classifies. A stronger model writes the final brief. A tiny model routes. Forcing one model to do all three is either slow, expensive, or weak.

### 2. Conflicting permissions

The researcher may read everything. The sender may only post to Slack after approval. Putting both in one agent means the loop always has the most dangerous tools available.

### 3. Hard review boundaries

If “author” and “reviewer” are the same loop, self-review is mostly theater. A separate reviewer agent (or a human gate) with a different prompt and checklist is a real control.

### 4. Parallel fan-out

Ten vendors to research, five repos to scan, twenty tickets to classify—fan out workers, then merge. A single sequential loop wastes wall clock.

### 5. Failure isolation

You want the writer to continue even if the optional enricher times out. Separate agents with explicit contracts make partial success designable.

```handoff
```

Multi-agent is not “more agents.” It is **clearer ownership per step**.

## A useful test (steal this)

Before you draw a swarm, run this filter:

```one-enough
```

Then ask one harsh question:

> If we keep a single agent for two more weeks, what concrete failure forces the split?

If you cannot name the failure—permission clash, review theater, serial latency, context bloat—you are adding architecture for the demo, not the job.

## Same goal, two designs

**Goal:** “Prepare a customer renewal brief for Acme.”

**Single agent (usually enough)**

1. Pull CRM, tickets, usage
2. Draft brief + email
3. Stop for human confirm on send

One loop. One eval: “Is the brief accurate and complete?”

**Multi-agent (when the org requires it)**

1. **Researcher** gathers facts (read-only tools)
2. **Risk** flags churn and contract constraints (different checklist)
3. **Writer** drafts from a structured brief packet
4. **Reviewer** checks claims against sources (no send tools)
5. **Policy / human** approves outbound mail

You pay for orchestration so permissions, review, and audit stay honest.

Neither design is morally superior. The second is justified when research rights, send rights, and review duty must not live in one process.

## Common traps

**“We used a multi-agent framework, so we’re multi-agent.”**  
If one prompt still owns every tool and every step, you have a single agent with extra packaging.

**“More agents will reduce hallucinations.”**  
They can—**if** a reviewer has different context and a real checklist. Extra agents that share the same mushy goal usually amplify drift.

**“We’ll start multi-agent so we don’t have to refactor.”**  
You will refactor anyway. Starting single teaches you the real handoff boundaries from production traces.

**“The orchestrator will figure it out.”**  
Orchestrators need contracts: inputs, outputs, timeouts, retries, and what “done” means per role. Without that, you built a chatroom.

## What good looks like

Ship this progression:

1. **Single agent, narrow tools, explicit stop** — log every plan/act/check turn.
2. **Read the traces** — find where the loop confuses roles, blows context, or holds excess power.
3. **Split only that seam** — extract one specialist (often reviewer or researcher) with a typed handoff.
4. **Eval both levels** — end-to-end success *and* per-role contract checks.

Checklist before you go multi-agent:

- What does each agent uniquely own?
- What exactly is passed at each handoff?
- Which tools exist only on which agent?
- How do we detect and recover a failed specialist?
- Can we still explain the run to a human in one screen?

If those answers are fuzzy, one loop is not just enough—it is safer.

## Try this

Take a workflow you are tempted to “agent-swarm.” Write two designs on one page:

1. **Single-loop version** — goal, tools, stop condition, success metric  
2. **Multi-agent version** — roles, handoffs, permissions, success metric  

Timebox building **(1)** first. Only promote a role out of the loop when traces show a repeated, named failure that a second agent would prevent.

Multi-agent is a scaling strategy for ownership and control.  
**One good loop remains the correct default.**
