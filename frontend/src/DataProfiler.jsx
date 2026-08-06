import { useRef, useState } from "react";
import { SAMPLE_DATASETS } from "./sampleDatasets";

const MAX_BYTES = 2_000_000;

function scoreTone(score) {
  if (score >= 80) return "good";
  if (score >= 55) return "warn";
  return "bad";
}

function StatRow({ label, value }) {
  return (
    <div className="profile-stat">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export default function DataProfiler() {
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeSample, setActiveSample] = useState(null);
  const fileInput = useRef(null);

  async function profile(csvText, filename) {
    setBusy(true);
    setStatus("Profiling in memory…");
    setReport(null);

    try {
      const response = await fetch("/api/demo/profile", {
        method: "POST",
        headers: { "Content-Type": "text/csv", "X-Filename": filename },
        body: csvText,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not profile that file.");
      setReport(data);
      setStatus("");
    } catch (error) {
      setStatus(error.message || "Could not profile that file.");
    } finally {
      setBusy(false);
    }
  }

  function runSample(sample) {
    setActiveSample(sample.id);
    profile(sample.csv, sample.filename);
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_BYTES) {
      setStatus("That file is over the 2 MB demo limit.");
      return;
    }

    setActiveSample(null);
    const text = await file.text();
    profile(text, file.name);
    event.target.value = "";
  }

  return (
    <div className="demo-panel">
      <div className="demo-controls">
        <div className="demo-samples">
          {SAMPLE_DATASETS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className={`demo-sample${activeSample === sample.id ? " is-active" : ""}`}
              onClick={() => runSample(sample)}
              disabled={busy}
            >
              <strong>{sample.label}</strong>
              <span>{sample.description}</span>
            </button>
          ))}
        </div>
        <div className="demo-upload">
          <button
            type="button"
            className="button button-small"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
          >
            Upload your own CSV
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv"
            onChange={handleUpload}
            hidden
          />
          <p className="demo-privacy">Parsed in memory, never stored. 2 MB limit.</p>
        </div>
      </div>

      {status && <p className="demo-status" role="status">{status}</p>}

      {report && (
        <div className="profile-report">
          <div className="profile-summary">
            <div className={`profile-score profile-score-${scoreTone(report.qualityScore)}`}>
              <span>Quality score</span>
              <strong>{report.qualityScore}</strong>
              <span>/ 100</span>
            </div>
            <div className="profile-facts">
              <StatRow label="File" value={report.filename} />
              <StatRow label="Rows" value={report.rowCount.toLocaleString()} />
              <StatRow label="Columns" value={report.columnCount} />
              <StatRow label="Duplicate rows" value={report.duplicateRows} />
            </div>
          </div>

          {report.datasetIssues.length > 0 && (
            <ul className="profile-issues">
              {report.datasetIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}

          <div className="profile-columns">
            {report.columns.map((column) => (
              <article className="profile-column" key={column.name}>
                <header>
                  <h4>{column.name}</h4>
                  <span className="profile-type">{column.inferredType}</span>
                </header>

                <div className="profile-bar" aria-hidden="true">
                  <span style={{ width: `${100 - column.missingPct}%` }} />
                </div>
                <p className="profile-fill">
                  {(100 - column.missingPct).toFixed(1)}% filled · {column.unique} distinct
                </p>

                {Object.keys(column.stats).length > 0 && (
                  <dl className="profile-numbers">
                    <div><dt>min</dt><dd>{column.stats.min}</dd></div>
                    <div><dt>median</dt><dd>{column.stats.median}</dd></div>
                    <div><dt>max</dt><dd>{column.stats.max}</dd></div>
                    <div><dt>std dev</dt><dd>{column.stats.stdDev}</dd></div>
                  </dl>
                )}

                {column.topValues.length > 0 && (
                  <ul className="profile-top">
                    {column.topValues.map((entry) => (
                      <li key={`${column.name}-${entry.value}`}>
                        <span>{entry.value || "(blank)"}</span>
                        <b>{entry.label}</b>
                      </li>
                    ))}
                  </ul>
                )}

                {column.issues.length > 0 && (
                  <ul className="profile-flags">
                    {column.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                )}

                {column.suggestedChecks.length > 0 && (
                  <div className="profile-checks">
                    <p>Suggested checks</p>
                    <ul>
                      {column.suggestedChecks.map((check) => (
                        <li key={check}>{check}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="demo-cta">
            <p>
              This is a scoped-down version of the data quality layer I build into production
              pipelines — with alerting, historical drift tracking, and owner routing.
            </p>
            <a className="button" href="#contact">Get this for your data</a>
          </div>
        </div>
      )}
    </div>
  );
}
