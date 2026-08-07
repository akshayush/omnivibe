import { useState, useEffect, isValidElement, Children, cloneElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogPosts, displayDate } from "./blogPosts";
import { JournalVisual, isJournalVisual, visualTypeFromLanguage } from "./JournalVisuals";
import DataProfiler from "./DataProfiler";
import AgentTrace from "./AgentTrace";
import { useReveal } from "./useReveal";

const SERVICES = [
  {
    number: "01",
    kicker: "Analytics & data consulting",
    title: "For teams whose numbers don’t agree",
    body:
      "Metric definitions, warehouse modelling, dashboard rebuilds, and audits of reporting nobody trusts anymore. You get a documented model, tested transformations, and numbers your team can defend in a meeting.",
    terms: "Typical: 2–6 weeks · Fixed scope or retainer",
    cta: "Try the data quality demo",
    href: "#playground",
  },
  {
    number: "02",
    kicker: "Data pipelines & platform",
    title: "For teams whose data arrives late or broken",
    body:
      "Ingestion, transformation, orchestration, data quality checks, and cost tuning. Built with tests and alerting from day one, so failures page you before they page your CEO.",
    terms: "Typical: 3–8 weeks · Fixed scope or retainer",
    cta: "See the quality checks we ship",
    href: "#playground",
  },
  {
    number: "03",
    kicker: "LLM applications",
    title: "For teams sitting on documents and text",
    body:
      "Retrieval over private knowledge, extraction, classification, and copilots — with retrieval quality measured, not assumed. Shipped with evals so you know when a model change breaks something.",
    terms: "Typical: 3–8 weeks · Fixed scope",
    cta: "Read how we evaluate them",
    href: "#journal",
  },
  {
    number: "04",
    kicker: "Agentic applications",
    title: "For work that needs tools, not just answers",
    body:
      "Agents that plan, call your systems, check their own work, and stop. Built with permission boundaries, human approval gates, and full run traces — because autonomy without oversight is a liability.",
    terms: "Typical: 4–10 weeks · Fixed scope",
    cta: "Replay a real agent run",
    href: "#playground",
  },
];

const OUTCOMES = [
  {
    metric: "Hours → minutes",
    detail: "Pipeline freshness for a Series B ops team after orchestration + quality gates.",
    sector: "Operations",
  },
  {
    metric: "One source of truth",
    detail: "Metric rebuild that stopped weekly reporting disputes in a fintech analytics org.",
    sector: "Fintech",
  },
  {
    metric: "0 unapproved writes",
    detail: "Agent path shipped with claim checks and a human gate before any outbound action.",
    sector: "AI systems",
  },
];

const CAPABILITIES = [
  "Python", "SQL", "TypeScript", "React", "FastAPI", "Postgres", "Snowflake", "BigQuery",
  "dbt", "Airflow", "Spark", "Kafka", "Docker", "AWS", "GCP", "Vercel",
  "LangGraph", "OpenAI", "Anthropic", "Vector databases", "Evals & tracing", "CI/CD",
];

const PROJECT_TYPES = [
  "Analytics & consulting",
  "Data pipelines",
  "LLM application",
  "Agentic application",
  "Something else",
];

const TIMELINES = ["ASAP", "This quarter", "Exploring"];
const BUDGETS = ["< $5k", "$5k–15k", "$15k–50k", "$50k+", "Not sure yet"];

function BrandMark({ className = "" }) {
  return (
    <svg className={`brand-mark ${className}`} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" className="brand-mark-bg" />
      <path
        d="M9 21V11l7 10 7-10v10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="brand-mark-glyph"
      />
    </svg>
  );
}

function MarkdownTable({ children, ...props }) {
  const headers = [];

  Children.forEach(children, (section) => {
    if (!isValidElement(section)) return;
    if (section.type === "thead") {
      Children.forEach(section.props.children, (row) => {
        if (!isValidElement(row)) return;
        Children.forEach(row.props.children, (cell) => {
          if (!isValidElement(cell)) return;
          headers.push(plainText(cell.props.children));
        });
      });
    }
  });

  const labeled = Children.map(children, (section) => {
    if (!isValidElement(section) || section.type !== "tbody") return section;
    return cloneElement(section, {
      children: Children.map(section.props.children, (row) => {
        if (!isValidElement(row)) return row;
        let cellIndex = 0;
        return cloneElement(row, {
          children: Children.map(row.props.children, (cell) => {
            if (!isValidElement(cell)) return cell;
            const label = headers[cellIndex] || "";
            cellIndex += 1;
            return cloneElement(cell, { "data-label": label });
          }),
        });
      }),
    });
  });

  return (
    <div className="table-wrap">
      <table {...props}>{labeled}</table>
    </div>
  );
}

function plainText(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(plainText).join("");
  if (isValidElement(node)) return plainText(node.props.children);
  return "";
}

function MarkdownPre({ children }) {
  return <>{children}</>;
}

function MarkdownCode({ className, children, ...props }) {
  const language = /language-([\w-]+)/.exec(className || "")?.[1] || "";
  const visualKey = language.startsWith("viz-") ? language : language ? `viz-${language}` : "";

  if (visualKey && isJournalVisual(visualKey)) {
    return <JournalVisual type={visualTypeFromLanguage(visualKey)} />;
  }

  const text = String(children);
  if (className || text.includes("\n")) {
    return (
      <pre className="post-pre">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  }

  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

export default function App() {
  const [formStatus, setFormStatus] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  useReveal();

  const [featuredPost, ...otherPosts] = blogPosts;

  useEffect(() => {
    if (!selectedPost) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [selectedPost]);

  async function submitInquiry(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    setFormStatus("Sending your enquiry…");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Unable to send inquiry.");
      setFormStatus(data.message);
      form.reset();
    } catch (error) {
      setFormStatus(error.message || "Unable to send inquiry. Please try again.");
    }
  }

  return (
    <main>
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="#top" aria-label="Omnivibe home">
            <BrandMark />
            <span className="brand-word">Omni<em>vibe</em></span>
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">Toggle navigation</span>
            <span /><span /><span />
          </button>
          <nav id="main-navigation" className={menuOpen ? "is-open" : ""} aria-label="Main navigation">
            <a href="#outcomes" onClick={() => setMenuOpen(false)}>Outcomes</a>
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#playground" onClick={() => setMenuOpen(false)}>Demos</a>
            <a href="#studio" onClick={() => setMenuOpen(false)}>Studio</a>
            <a href="#journal" onClick={() => setMenuOpen(false)}>Journal</a>
          </nav>
          <a className="button button-small" href="#contact">Start a project</a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-plane" aria-hidden="true">
          <div className="hero-grid-lines" />
          <div className="hero-orb hero-orb-a" />
          <div className="hero-orb hero-orb-b" />
          <div className="hero-flow">
            <span>ingest</span>
            <span>model</span>
            <span>decide</span>
            <span>ship</span>
          </div>
        </div>
        <div className="container hero-copy">
          <p className="hero-brand">Omnivibe</p>
          <h1>Systems that move data and make decisions.</h1>
          <p className="lead">
            We build production pipelines, analytics, LLM apps, and agents — with the tests,
            traces, and handover that keep them running.
          </p>
          <div className="action-row">
            <a className="button" href="#playground">See it working</a>
            <a className="button button-ghost" href="#contact">Start a project</a>
          </div>
        </div>
      </section>

      <section className="section outcomes-section reveal" id="outcomes">
        <div className="container">
          <p className="eyebrow">Proof from delivery</p>
          <h2>Outcomes you can measure, not slides you can ignore.</h2>
          <p className="section-intro">
            Recent anonymized engagements. Same engineering bar whether the brief arrives as a
            spec or a messy Slack thread.
          </p>
          <div className="outcome-list">
            {OUTCOMES.map((item) => (
              <article className="outcome-row" key={item.metric}>
                <p className="outcome-sector">{item.sector}</p>
                <h3>{item.metric}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
          <div className="ship-strip">
            <p className="ship-label">How the work ships</p>
            <ol className="ship-steps">
              <li><b>01</b><span>Source data</span><em>→</em><span>Modelled + tested</span></li>
              <li><b>02</b><span>Tools</span><em>→</em><span>Agent workflow</span></li>
              <li><b>03</b><span>Evaluation</span><em>→</em><span>Ship with confidence</span></li>
            </ol>
          </div>
        </div>
      </section>

      <section className="section services-section reveal" id="services">
        <div className="container">
          <p className="eyebrow">What we build</p>
          <h2>Four common starting points. The scope is not the limit.</h2>
          <p className="section-intro">
            Most engagements begin as one of these. Many end somewhere else — a migration that
            became a platform, a dashboard that became a data product.
          </p>

          <div className="service-list">
            {SERVICES.map((service) => (
              <article className="service-row" key={service.number}>
                <span className="service-num">{service.number}</span>
                <div className="service-body">
                  <p className="card-kicker">{service.kicker}</p>
                  <h3>{service.title}</h3>
                  <p>{service.body}</p>
                  <p className="service-terms">{service.terms}</p>
                  <a className="text-link" href={service.href}>{service.cta} <span>→</span></a>
                </div>
              </article>
            ))}
          </div>

          <div className="service-open">
            <p className="card-kicker">Open scope</p>
            <h3>Not on this list? That is usually a yes.</h3>
            <p>
              Internal tools, API integrations, cloud migrations, automation, scraping and
              enrichment, ML deployment, performance rescues, legacy untangling, or an idea
              that does not have a category yet. Bring the problem, not the spec.
            </p>
            <a className="button" href="#contact">Describe your problem</a>
          </div>

          <div className="capability-strip">
            <p className="capability-title">Stack we work in</p>
            <p className="capability-line">{CAPABILITIES.join(" · ")}</p>
            <p className="capability-note">New tool in your stack? We pick it up.</p>
          </div>
        </div>
      </section>

      <section className="section playground-section reveal" id="playground">
        <div className="container">
          <p className="eyebrow">Live demos</p>
          <h2>Proof you can click, not a portfolio screenshot.</h2>
          <p className="section-intro">
            These run in the browser against the same engineering patterns we ship to clients.
            Nothing you upload is stored.
          </p>

          <div className="demo-block">
            <div className="demo-heading">
              <h3>Data quality auditor</h3>
              <p>
                Profile a dataset in seconds: types, null rates, distinct counts, outliers,
                duplicates, and the data-quality checks we put in production pipelines.
              </p>
            </div>
            <DataProfiler />
          </div>

          <div className="demo-block">
            <div className="demo-heading">
              <h3>Agent run trace</h3>
              <p>
                A replay of a real tool-using agent run — including the tool failure it recovered
                from and the approval gate that stopped it before a write action.
              </p>
            </div>
            <AgentTrace />
          </div>
        </div>
      </section>

      <section className="section program-section reveal" id="process">
        <div className="container program-grid">
          <div>
            <p className="eyebrow">How we work</p>
            <h2>Small scopes, visible progress, no black boxes.</h2>
            <p className="section-intro">
              You should be able to cancel after any milestone and still own something useful.
              That constraint keeps the work honest.
            </p>
            <p className="engagement-line">
              Fixed-scope project · Monthly retainer · Hourly advisory
            </p>
            <a className="button" href="#contact">Book a scope call</a>
          </div>
          <ol className="curriculum">
            <li><b>01</b><div><h3>Scope call</h3><p>Free, 30 minutes. We decide together if this is worth building.</p></div></li>
            <li><b>02</b><div><h3>Written plan</h3><p>Approach, milestones, and fixed price or rate before any code.</p></div></li>
            <li><b>03</b><div><h3>Weekly demos</h3><p>You see working software each week, not a status update.</p></div></li>
            <li><b>04</b><div><h3>Handover</h3><p>Documented, tested, and yours. No lock-in to Omnivibe.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section studio-section reveal" id="studio">
        <div className="container studio-grid">
          <div>
            <p className="eyebrow">The studio</p>
            <h2>A small engineering company, not a slide deck agency.</h2>
            <p className="section-intro">
              Omnivibe is built by practitioners who still write the systems — data platforms,
              LLM products, and agent workflows that have to survive real operators, not just demos.
            </p>
            <p className="studio-copy">
              We keep the team lean on purpose: fewer handoffs, faster feedback, and engineers
              who can explain a trade-off in plain language. Remote by default. Taking on new
              client projects with typical starts inside two weeks.
            </p>
          </div>
          <aside className="studio-panel" aria-label="Studio principles">
            <p><strong>Build-first</strong><span>Working software every week</span></p>
            <p><strong>Evidence over vibes</strong><span>Architecture, evals, and traces</span></p>
            <p><strong>No black boxes</strong><span>Documented handover, no lock-in</span></p>
          </aside>
        </div>
      </section>

      <section className="section journal-section reveal" id="journal">
        <div className="container">
          <p className="eyebrow">Engineering journal</p>
          <h2>How we think about building this stuff.</h2>
          <p className="section-intro">
            Working notes on data and AI systems: what to build, what to skip, and why.
            The cheapest way to judge how Omnivibe thinks before you hire us.
          </p>

          {featuredPost && (
            <article className="journal-feature">
              <p className="journal-meta">{displayDate(featuredPost.date)} · {featuredPost.readTime}</p>
              <h3>{featuredPost.title}</h3>
              <p>{featuredPost.excerpt}</p>
              <button className="text-link journal-open" type="button" onClick={() => setSelectedPost(featuredPost)}>
                Read the note <span>→</span>
              </button>
            </article>
          )}

          {otherPosts.length > 0 && (
            <div className="journal-list">
              {otherPosts.map((post) => (
                <article className="journal-row" key={post.slug}>
                  <p className="journal-meta">{displayDate(post.date)} · {post.readTime}</p>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <button className="text-link journal-open" type="button" onClick={() => setSelectedPost(post)}>
                    Read the note <span>→</span>
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedPost && (
        <div className="post-overlay" role="dialog" aria-modal="true" aria-label={selectedPost.title}>
          <article className="post-reader">
            <button className="post-close" type="button" onClick={() => setSelectedPost(null)} aria-label="Close article">×</button>
            <p className="journal-meta">{displayDate(selectedPost.date)} · {selectedPost.readTime}</p>
            <h2>{selectedPost.title}</h2>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ node: _node, ...props }) => <MarkdownTable {...props} />,
                pre: MarkdownPre,
                code: MarkdownCode,
              }}
            >
              {selectedPost.body}
            </ReactMarkdown>
          </article>
        </div>
      )}

      <section className="section contact-section reveal" id="contact">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow">Start a project</p>
            <h2>Tell us what’s broken.</h2>
            <p className="section-intro">
              No spec required. A paragraph about the problem is enough to start.
              You will get a real reply with a suggested next step — not a sales sequence.
            </p>
            <ul className="contact-points">
              <li>Free 30-minute scope call</li>
              <li>Written plan and price before any code</li>
              <li>Happy to say when it should not be built</li>
            </ul>
          </div>
          <form className="contact-form" onSubmit={submitInquiry}>
            <div className="form-row">
              <label>Name<input name="name" required minLength="2" autoComplete="name" /></label>
              <label>Email<input type="email" name="email" required autoComplete="email" /></label>
            </div>
            <label>
              What do you need?
              <select name="projectType" defaultValue={PROJECT_TYPES[0]}>
                {PROJECT_TYPES.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <div className="form-row">
              <label>
                Timeline
                <select name="timeline" defaultValue={TIMELINES[1]}>
                  {TIMELINES.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label>
                Budget range
                <select name="budget" defaultValue={BUDGETS[4]}>
                  {BUDGETS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            </div>
            <label>Current stack (optional)<input name="stack" maxLength="300" placeholder="Postgres, dbt, Airflow…" /></label>
            <label>The problem<textarea name="message" required minLength="10" rows="4" placeholder="What is broken, slow, manual, or missing?" /></label>
            <button className="button" type="submit">Send enquiry</button>
            <p className="form-status" role="status">{formStatus}</p>
          </form>
        </div>
      </section>

      <footer>
        <div className="container footer">
          <a className="brand" href="#top">
            <BrandMark />
            <span className="brand-word">Omni<em>vibe</em></span>
          </a>
          <p>Data engineering, AI systems, and custom software — built to survive production.</p>
          <p>© {new Date().getFullYear()}</p>
        </div>
      </footer>

      <div className="mobile-cta" aria-label="Mobile project call to action">
        <a className="button" href="#contact">Start a project</a>
      </div>
    </main>
  );
}
