import { useEffect, useRef, useState } from "react";
import { AGENT_RUN } from "./agentRun";

const PHASE_LABEL = {
  plan: "Plan",
  act: "Act",
  check: "Check",
  done: "Done",
};

const STEP_DELAY_MS = 750;

export default function AgentTrace() {
  const [visible, setVisible] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return undefined;

    timer.current = setInterval(() => {
      setVisible((count) => {
        if (count >= AGENT_RUN.steps.length) {
          setPlaying(false);
          return count;
        }
        return count + 1;
      });
    }, STEP_DELAY_MS);

    return () => clearInterval(timer.current);
  }, [playing]);

  function play() {
    if (visible >= AGENT_RUN.steps.length) setVisible(0);
    setPlaying(true);
  }

  const finished = visible >= AGENT_RUN.steps.length;

  return (
    <div className="demo-panel">
      <div className="trace-head">
        <div>
          <p className="trace-goal-label">Goal</p>
          <p className="trace-goal">{AGENT_RUN.goal}</p>
          <p className="trace-meta">{AGENT_RUN.model}</p>
        </div>
        <div className="trace-actions">
          <button type="button" className="button button-small" onClick={play} disabled={playing}>
            {playing ? "Replaying…" : finished ? "Replay run" : "Play run"}
          </button>
          <button
            type="button"
            className="button button-small button-ghost"
            onClick={() => {
              setPlaying(false);
              setVisible(AGENT_RUN.steps.length);
            }}
          >
            Show all steps
          </button>
        </div>
      </div>

      <ol className="trace-list">
        {AGENT_RUN.steps.slice(0, visible).map((step, index) => (
          <li key={step.title} className={`trace-step trace-${step.status}`}>
            <div className="trace-step-head">
              <span className="trace-phase">{PHASE_LABEL[step.phase] || step.phase}</span>
              <span className="trace-index">{index + 1}</span>
              <h4>{step.title}</h4>
            </div>
            <p>{step.detail}</p>
            <div className="trace-step-foot">
              {step.tool && <code>{step.tool}</code>}
              <span>{(step.ms / 1000).toFixed(1)}s</span>
            </div>
          </li>
        ))}
      </ol>

      {visible === 0 && (
        <p className="demo-status">Press play to replay a real agent run, step by step.</p>
      )}

      {finished && (
        <>
          <div className="trace-evals">
            <p className="trace-evals-title">Run scorecard</p>
            <div className="trace-eval-grid">
              {AGENT_RUN.evals.map((entry) => (
                <div className={`trace-eval trace-eval-${entry.tone}`} key={entry.name}>
                  <span>{entry.name}</span>
                  <strong>{entry.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="demo-cta">
            <p>
              Most agent demos show the answer. The traces, retries, and approval gates are what make
              one safe to run against your systems — that is the part I build.
            </p>
            <a className="button" href="#contact">Talk about an agent build</a>
          </div>
        </>
      )}
    </div>
  );
}
