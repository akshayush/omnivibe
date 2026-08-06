const VISUALS = {
  stack: (
    <div className="viz viz-stack" role="img" aria-label="Nested stack: LLM inside Agent inside Agentic AI">
      <div className="viz-layer viz-layer-outer">
        <p className="viz-layer-title">Agentic AI</p>
        <p className="viz-layer-copy">orchestration · policy · evals · humans</p>
        <div className="viz-layer viz-layer-mid">
          <p className="viz-layer-title">Agent</p>
          <p className="viz-layer-copy">tools · memory · plan / act / check</p>
          <div className="viz-layer viz-layer-inner">
            <p className="viz-layer-title">LLM</p>
            <p className="viz-layer-copy">reason · write · classify</p>
          </div>
        </div>
      </div>
      <p className="viz-caption">capability → actor → operating system</p>
    </div>
  ),
  prompt: (
    <div className="viz viz-steps" role="img" aria-label="Prompt flows to LLM and back as an answer">
      <div className="viz-step">You</div>
      <span className="viz-arrow">prompt →</span>
      <div className="viz-step viz-step-accent">LLM</div>
      <span className="viz-arrow">answer →</span>
      <div className="viz-step">You</div>
    </div>
  ),
  loop: (
    <div className="viz viz-loop" role="img" aria-label="Agent loop: goal, plan, act, check, result">
      <div className="viz-loop-item viz-loop-goal">Goal</div>
      <span className="viz-arrow viz-arrow-down">↓</span>
      <div className="viz-loop-cycle">
        <div className="viz-loop-item">1. Plan (LLM)</div>
        <span className="viz-arrow viz-arrow-down">↓</span>
        <div className="viz-loop-item">2. Act (tools)</div>
        <span className="viz-arrow viz-arrow-down">↓</span>
        <div className="viz-loop-item">3. Check</div>
        <div className="viz-loop-branches">
          <span className="viz-chip">retry ↑</span>
          <span className="viz-chip viz-chip-done">done →</span>
        </div>
      </div>
      <div className="viz-loop-item viz-loop-result">Result</div>
    </div>
  ),
  handoff: (
    <div className="viz viz-handoff" role="img" aria-label="Multi-agent handoff with approval">
      <div className="viz-chip-row">
        <span className="viz-chip">Research</span>
        <span className="viz-arrow">→</span>
        <span className="viz-chip">Risk</span>
        <span className="viz-arrow">→</span>
        <span className="viz-chip">Writer</span>
        <span className="viz-arrow">→</span>
        <span className="viz-chip">Reviewer</span>
      </div>
      <div className="viz-note">shared memory + policy</div>
      <div className="viz-chip-row">
        <span className="viz-chip viz-chip-warn">Human approval?</span>
      </div>
      <div className="viz-chip-row">
        <span className="viz-chip viz-chip-done">yes → Send</span>
        <span className="viz-chip">no → Hold / revise</span>
      </div>
    </div>
  ),
  levels: (
    <div className="viz viz-levels" role="img" aria-label="Same goal at three automation levels">
      <article className="viz-level">
        <strong>LLM only</strong>
        <ol>
          <li>Paste notes</li>
          <li>Draft brief</li>
          <li>You verify &amp; send</li>
        </ol>
      </article>
      <article className="viz-level">
        <strong>Single agent</strong>
        <ol>
          <li>Pull CRM + tickets</li>
          <li>Draft brief + email</li>
          <li>Ask you to confirm</li>
        </ol>
      </article>
      <article className="viz-level viz-level-accent">
        <strong>Agentic system</strong>
        <ol>
          <li>Research → risk → write</li>
          <li>Review + policy gate</li>
          <li>Approve → audit trail</li>
        </ol>
      </article>
    </div>
  ),
  decide: (
    <div className="viz viz-decide" role="img" aria-label="Decision flow for choosing LLM, agent, or agentic AI">
      <div className="viz-decide-q">One good answer enough?</div>
      <div className="viz-decide-row">
        <span className="viz-chip viz-chip-done">yes → use an LLM</span>
        <span className="viz-chip">no ↓</span>
      </div>
      <div className="viz-decide-q">Need tools + a finish condition?</div>
      <div className="viz-decide-row">
        <span className="viz-chip viz-chip-done">yes → build an agent</span>
        <span className="viz-chip">no ↓</span>
      </div>
      <div className="viz-decide-q">Need roles, policy, oversight?</div>
      <div className="viz-decide-row">
        <span className="viz-chip viz-chip-done">yes → design agentic AI</span>
      </div>
    </div>
  ),
  labels: (
    <div className="viz viz-labels" role="img" aria-label="Label workflow steps as think, act, or coordinate">
      <div className="viz-label-card"><strong>Think</strong><span>LLM reasoning</span></div>
      <div className="viz-label-card"><strong>Act</strong><span>agent tool use</span></div>
      <div className="viz-label-card"><strong>Coord</strong><span>approve / recover / hand off</span></div>
    </div>
  ),
  single: (
    <div className="viz viz-single" role="img" aria-label="Single agent: one goal, one loop, one tool belt">
      <div className="viz-decide-q">One goal</div>
      <div className="viz-chip-row">
        <span className="viz-chip viz-chip-done">One agent loop</span>
      </div>
      <div className="viz-note">plan → act → check → done</div>
      <div className="viz-chip-row">
        <span className="viz-chip">shared tool belt</span>
        <span className="viz-chip">one memory</span>
        <span className="viz-chip">one stop condition</span>
      </div>
    </div>
  ),
  multi: (
    <div className="viz viz-handoff" role="img" aria-label="Multi-agent: specialists coordinated toward one outcome">
      <div className="viz-decide-q">One outcome, many roles</div>
      <div className="viz-chip-row">
        <span className="viz-chip">Researcher</span>
        <span className="viz-arrow">→</span>
        <span className="viz-chip">Worker</span>
        <span className="viz-arrow">→</span>
        <span className="viz-chip">Reviewer</span>
      </div>
      <div className="viz-note">orchestrator · shared state · handoff contracts</div>
      <div className="viz-chip-row">
        <span className="viz-chip viz-chip-warn">separate prompts + tools</span>
        <span className="viz-chip viz-chip-done">clear ownership per step</span>
      </div>
    </div>
  ),
  "one-enough": (
    <div className="viz viz-decide" role="img" aria-label="Decision flow for staying with one agent loop">
      <div className="viz-decide-q">One clear goal + one tool belt?</div>
      <div className="viz-decide-row">
        <span className="viz-chip viz-chip-done">yes → single agent</span>
        <span className="viz-chip">no ↓</span>
      </div>
      <div className="viz-decide-q">Do steps need different skills, models, or permissions?</div>
      <div className="viz-decide-row">
        <span className="viz-chip">no → keep one loop</span>
        <span className="viz-chip viz-chip-done">yes ↓</span>
      </div>
      <div className="viz-decide-q">Is failure isolation or parallel work worth the cost?</div>
      <div className="viz-decide-row">
        <span className="viz-chip viz-chip-done">yes → multi-agent</span>
        <span className="viz-chip">no → stay single</span>
      </div>
    </div>
  ),
};

export function JournalVisual({ type }) {
  return VISUALS[type] || null;
}

export function isJournalVisual(language) {
  return Boolean(language && VISUALS[language.replace(/^viz-/, "")]);
}

export function visualTypeFromLanguage(language) {
  return language?.replace(/^viz-/, "") || "";
}
