import { useState, useEffect, isValidElement, Children, cloneElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogPosts, displayDate } from "./blogPosts";
import { JournalVisual, isJournalVisual, visualTypeFromLanguage } from "./JournalVisuals";
import DataProfiler from "./DataProfiler";
import AgentTrace from "./AgentTrace";

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
    cta: "See the quality checks I ship",
    href: "#playground",
  },
  {
    number: "03",
    kicker: "LLM applications",
    title: "For teams sitting on documents and text",
    body:
      "Retrieval over private knowledge, extraction, classification, and copilots — with retrieval quality measured, not assumed. Shipped with evals so you know when a model change breaks something.",
    terms: "Typical: 3–8 weeks · Fixed scope",
    cta: "Read how I evaluate them",
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
            Omni<span>vibe</span>
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
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#playground" onClick={() => setMenuOpen(false)}>Live demos</a>
            <a href="#process" onClick={() => setMenuOpen(false)}>How I work</a>
            <a href="#journal" onClick={() => setMenuOpen(false)}>Journal</a>
          </nav>
          <a className="button button-small" href="#contact">Start a project</a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Data engineering · AI systems · Custom software</p>
            <h1>If it moves data or makes decisions, I can build it.</h1>
            <p className="lead">
              I design and ship production systems end to end — pipelines, analytics,
              LLM applications, agents, APIs, and the unglamorous reliability work that
              keeps them running. Some clients arrive with a spec. Most arrive with a
              messy problem. Both are fine.
            </p>
            <div className="action-row">
              <a className="button" href="#playground">See it working</a>
              <a className="button button-ghost" href="#contact">Start a project</a>
            </div>
            <p className="hero-availability">
              Available for freelance and contract work · Remote · Typical start: within 2 weeks
            </p>
          </div>
          <aside className="blueprint-card" aria-label="Production system blueprint">
            <div className="window-dots"><i /><i /><i /></div>
            <p className="code-label">HOW THE WORK SHIPS</p>
            <div className="flow-row"><b>01</b><span>Source data</span><em>→</em><span>Modelled + tested</span></div>
            <div className="flow-row"><b>02</b><span>Tools</span><em>→</em><span>Agent workflow</span></div>
            <div className="flow-row"><b>03</b><span>Evaluation</span><em>→</em><span>Ship with confidence</span></div>
            <p className="blueprint-note">Built with tests, traces, and alerting from day one — not bolted on later.</p>
          </aside>
        </div>
      </section>

      <section className="proof-strip">
        <div className="container proof-grid">
          <p><strong>Build-first</strong><span>Working software every week, not status decks</span></p>
          <p><strong>Clear thinking</strong><span>Architecture, trade-offs, and evidence</span></p>
          <p><strong>No black boxes</strong><span>Documented, tested, and handed over</span></p>
        </div>
      </section>

      <section className="section" id="services">
        <div className="container">
          <p className="eyebrow">What I build</p>
          <h2>Four common starting points. The scope is not the limit.</h2>
          <p className="section-intro">
            Most engagements begin as one of these. Many end up somewhere else — a migration
            that became a platform, a dashboard that became a data product. The engineering
            is the same discipline either way.
          </p>

          <div className="service-grid">
            {SERVICES.map((service) => (
              <article className="service-card" key={service.number}>
                <span className="card-number">{service.number}</span>
                <p className="card-kicker">{service.kicker}</p>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
                <p className="service-terms">{service.terms}</p>
                <a className="text-link" href={service.href}>{service.cta} <span>→</span></a>
              </article>
            ))}
          </div>

          <article className="service-open">
            <p className="card-kicker">Open scope</p>
            <h3>Not on this list? That is usually a yes.</h3>
            <p>
              Internal tools, API integrations, cloud migrations, automation, scraping and
              enrichment, ML deployment, performance rescues, legacy untangling, or an idea
              that does not have a category yet.
            </p>
            <p>
              Bring the problem, not the spec. The first call is figuring out whether it should
              be built at all — and if so, the smallest version that proves it.
            </p>
            <a className="button" href="#contact">Describe your problem</a>
          </article>

          <div className="capability-strip">
            <p className="capability-title">Stack I work in</p>
            <div className="capability-list">
              {CAPABILITIES.map((item) => <span key={item}>{item}</span>)}
            </div>
            <p className="capability-note">New tool in your stack? I have learned worse.</p>
          </div>
        </div>
      </section>

      <section className="section playground-section" id="playground">
        <div className="container">
          <p className="eyebrow">Live demos</p>
          <h2>Proof you can click, not a portfolio screenshot.</h2>
          <p className="section-intro">
            These run in the browser against the same engineering patterns I ship to clients.
            Nothing you upload is stored.
          </p>

          <div className="demo-block">
            <div className="demo-heading">
              <h3>Data quality auditor</h3>
              <p>
                Profile a dataset in seconds: types, null rates, distinct counts, outliers,
                duplicates, and the data-quality checks I would put in your pipeline.
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

      <section className="section program-section" id="process">
        <div className="container program-grid">
          <div>
            <p className="eyebrow">How I work</p>
            <h2>Small scopes, visible progress, no black boxes.</h2>
            <p className="section-intro">
              You should be able to cancel after any milestone and still own something useful.
              That constraint keeps the work honest.
            </p>
            <div className="badges">
              <span>Fixed-scope project</span>
              <span>Monthly retainer</span>
              <span>Hourly advisory</span>
            </div>
            <a className="button" href="#contact">Book a scope call</a>
          </div>
          <ol className="curriculum">
            <li><b>01</b><div><h3>Scope call</h3><p>Free, 30 minutes. We decide together if this is worth building.</p></div></li>
            <li><b>02</b><div><h3>Written plan</h3><p>Approach, milestones, and fixed price or rate before any code.</p></div></li>
            <li><b>03</b><div><h3>Weekly demos</h3><p>You see working software each week, not a status update.</p></div></li>
            <li><b>04</b><div><h3>Handover</h3><p>Documented, tested, and yours. No lock-in to me.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section channels">
        <div className="container channels-layout">
          <div><p className="eyebrow">Where the thinking shows up</p><h2>I write the engineering down.</h2></div>
          <p className="section-intro">The journal below is the same reasoning I bring to client work — architecture trade-offs, reliability patterns, and honest limits. It is the cheapest way to judge how I think before you hire me.</p>
        </div>
        <div className="container channel-list">
          {["Open source", "Journal", "LinkedIn", "Video", "Short-form", "Workshops"].map((channel) => <span key={channel}>{channel}</span>)}
        </div>
      </section>

      <section className="section journal-section" id="journal">
        <div className="container">
          <p className="eyebrow">Engineering journal</p>
          <h2>How I think about building this stuff.</h2>
          <p className="section-intro">
            Working notes on data and AI systems: what to build, what to skip, and why.
            Written from delivery experience, not press releases.
          </p>
          <div className="journal-grid">
            {blogPosts.map((post) => (
              <article className="journal-card" key={post.slug}>
                <p className="journal-meta">{displayDate(post.date)} · {post.readTime}</p>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <button className="text-link journal-open" type="button" onClick={() => setSelectedPost(post)}>
                  Read the note <span>→</span>
                </button>
              </article>
            ))}
          </div>
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

      <section className="section contact-section" id="contact">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow">Start a project</p>
            <h2>Tell me what’s broken.</h2>
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
        <div className="container footer"><a className="brand" href="#top">Omni<span>vibe</span></a><p>Data engineering, AI systems, and custom software — built to survive production.</p><p>© {new Date().getFullYear()}</p></div>
      </footer>
    </main>
  );
}
