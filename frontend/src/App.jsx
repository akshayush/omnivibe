import { useState, isValidElement, Children, cloneElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogPosts, displayDate } from "./blogPosts";
import { JournalVisual, isJournalVisual, visualTypeFromLanguage } from "./JournalVisuals";

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

  async function submitInquiry(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    setFormStatus("Sending your inquiry…");

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
            <a href="#learn" onClick={() => setMenuOpen(false)}>Learning</a>
            <a href="#journal" onClick={() => setMenuOpen(false)}>Daily journal</a>
            <a href="#services" onClick={() => setMenuOpen(false)}>For teams</a>
            <a href="#program" onClick={() => setMenuOpen(false)}>Program</a>
          </nav>
          <a className="button button-small" href="#contact">Start a conversation</a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Practical AI engineering · Technical education</p>
            <h1>Turn ambitious AI ideas into systems people can use.</h1>
            <p className="lead">
              Omnivibe teaches the engineering behind dependable AI products.
              Learn through complete builds, clear trade-offs, and reusable patterns
              — or partner with us to educate your developer audience.
            </p>
            <div className="action-row">
              <a className="button" href="#learn">Explore learning</a>
              <a className="button button-ghost" href="#services">Partner with us</a>
            </div>
          </div>
          <aside className="blueprint-card" aria-label="Production AI system blueprint">
            <div className="window-dots"><i /><i /><i /></div>
            <p className="code-label">SYSTEM BLUEPRINT</p>
            <div className="flow-row"><b>01</b><span>Source data</span><em>→</em><span>Search layer</span></div>
            <div className="flow-row"><b>02</b><span>Tools</span><em>→</em><span>Agent workflow</span></div>
            <div className="flow-row"><b>03</b><span>Evaluation</span><em>→</em><span>Release with confidence</span></div>
            <p className="blueprint-note">Learn the whole system, including the parts that make it reliable.</p>
          </aside>
        </div>
      </section>

      <section className="proof-strip">
        <div className="container proof-grid">
          <p><strong>Build-first</strong><span>Learning grounded in working systems</span></p>
          <p><strong>Clear thinking</strong><span>Architecture, trade-offs, and evidence</span></p>
          <p><strong>Useful media</strong><span>Technical stories developers value</span></p>
        </div>
      </section>

      <section className="section" id="learn">
        <div className="container">
          <p className="eyebrow">Start where you are</p>
          <h2>Two paths. One focus: useful AI.</h2>
          <p className="section-intro">Choose the kind of progress you need today, then follow a path designed around tangible outcomes.</p>
          <div className="path-grid">
            <article className="path-card">
              <span className="card-number">01</span>
              <p className="card-kicker">For builders</p>
              <h3>Develop production-ready AI skills</h3>
              <p>Go beyond isolated prompts. Work through complete application patterns with code, context, and engineering decisions included.</p>
              <ul>
                <li>Guided end-to-end projects</li>
                <li>Implementation notes you can reference later</li>
                <li>Practical lessons on quality and reliability</li>
              </ul>
              <a className="text-link" href="#program">View the program <span>→</span></a>
            </article>
            <article className="path-card path-card-accent" id="services">
              <span className="card-number">02</span>
              <p className="card-kicker">For AI teams</p>
              <h3>Help developers understand your product</h3>
              <p>Make your product easier to evaluate and adopt with credible technical education built around real implementation.</p>
              <ul>
                <li>Technical tutorials and project narratives</li>
                <li>Educational editorial campaigns</li>
                <li>Adaptable content for developer channels</li>
              </ul>
              <a className="text-link" href="#contact">Discuss a partnership <span>→</span></a>
            </article>
          </div>
        </div>
      </section>

      <section className="section program-section" id="program">
        <div className="container program-grid">
          <div>
            <p className="eyebrow">Featured learning track</p>
            <h2>Agent Systems: from prototype to dependable product.</h2>
            <p className="section-intro">A structured build that connects retrieval, tools, orchestration, evaluation, and observability into one coherent system.</p>
            <div className="badges"><span>Self-paced</span><span>Code-along labs</span><span>Production patterns</span></div>
            <a className="button" href="#contact">Request program details</a>
          </div>
          <ol className="curriculum">
            <li><b>01</b><div><h3>Prepare knowledge</h3><p>Design dependable ingestion, chunking, and indexing workflows.</p></div></li>
            <li><b>02</b><div><h3>Retrieve with intent</h3><p>Combine search approaches and assess the quality of results.</p></div></li>
            <li><b>03</b><div><h3>Coordinate agents</h3><p>Connect tools, instructions, state, and safe handoffs.</p></div></li>
            <li><b>04</b><div><h3>Measure what matters</h3><p>Introduce tracing, evaluation, and feedback loops before launch.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section channels">
        <div className="container channels-layout">
          <div><p className="eyebrow">Technical media</p><h2>One useful idea, thoughtfully distributed.</h2></div>
          <p className="section-intro">We shape technical stories for the places builders already learn: source code, long-form explanations, concise social education, and video.</p>
        </div>
        <div className="container channel-list">
          {["Open source", "Newsletter", "LinkedIn", "Video", "Short-form", "Workshops"].map((channel) => <span key={channel}>{channel}</span>)}
        </div>
      </section>

      <section className="section journal-section" id="journal">
        <div className="container">
          <p className="eyebrow">The Omnivibe daily journal</p>
          <h2>One useful AI idea, every day.</h2>
          <p className="section-intro">Short notes for curious learners and builders. Read the latest idea now, then return for tomorrow’s.</p>
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
            <p className="eyebrow">Let’s make progress</p>
            <h2>Tell us what you’re building.</h2>
            <p className="section-intro">Share your learning goal or developer education challenge. We’ll respond with the best next step.</p>
          </div>
          <form className="contact-form" onSubmit={submitInquiry}>
            <label>Name<input name="name" required minLength="2" autoComplete="name" /></label>
            <label>Email<input type="email" name="email" required autoComplete="email" /></label>
            <label>How can we help?<textarea name="message" required minLength="10" rows="4" /></label>
            <button className="button" type="submit">Send inquiry</button>
            <p className="form-status" role="status">{formStatus}</p>
          </form>
        </div>
      </section>

      <footer>
        <div className="container footer"><a className="brand" href="#top">Omni<span>vibe</span></a><p>Practical AI engineering education and technical media.</p><p>© {new Date().getFullYear()}</p></div>
      </footer>
    </main>
  );
}
