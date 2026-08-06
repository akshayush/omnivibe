# Omnivibe Daily Journal — system guide

This document records how the Omnivibe Daily Journal is created, stored, loaded, rendered, and published. It covers both the **data path** (Markdown files in the repo) and the **UI path** (homepage journal section + article reader).

There is **no admin UI and no database** for journal posts today. Creating a journal entry means adding a Markdown file, committing it, and deploying `main`.

---

## 1. Architecture at a glance

```text
┌─────────────────────────────────────────────────────────────┐
│  CREATE (data / authoring)                                  │
│  Markdown file in frontend/src/content/blog/*.post.md       │
│  → git commit → merge to main → Vercel / Docker build       │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  BUILD                                                      │
│  Vite import.meta.glob loads every *.post.md as raw text    │
│  blogPosts.js parses frontmatter → in-memory post objects   │
│  Bundled into the static frontend (no runtime API fetch)    │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  UI (read)                                                  │
│  #journal grid of cards → click “Read the note”             │
│  → full-screen overlay reader with Markdown + visuals       │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Role |
| --- | --- | --- |
| Storage | Git + Markdown files | Source of truth for posts |
| Loader | `frontend/src/blogPosts.js` | Discover, parse, sort posts at build time |
| Listing UI | `App.jsx` `#journal` section | Cards with title, excerpt, date, read time |
| Reader UI | `App.jsx` overlay + `ReactMarkdown` | Full article body |
| Visuals | `JournalVisuals.jsx` | Responsive diagram blocks from fenced code |
| Styles | `styles.css` (`.journal-*`, `.post-*`, `.viz-*`) | Desktop + mobile layout |
| Publish | Merge to `main` | Vercel production deploy (or Docker image build) |

---

## 2. Data model

### 2.1 Location

```text
frontend/src/content/blog/
├── POST_TEMPLATE.md                              # writing reference (NOT published)
├── 2026-08-04-welcome-to-omnivibe.post.md        # published
└── 2026-08-05-llm-vs-agents-vs-agentic-ai.post.md # published
```

### 2.2 Publish rule

- **Published:** only files matching `*.post.md`
- **Not published:** `POST_TEMPLATE.md` and any other non-`.post.md` files

This is enforced by the Vite glob in `blogPosts.js`:

```js
import.meta.glob("./content/blog/*.post.md", {
  eager: true,
  import: "default",
  query: "?raw",
});
```

### 2.3 Filename convention

```text
YYYY-MM-DD-your-post-slug.post.md
```

Examples:

- `2026-08-04-welcome-to-omnivibe.post.md`
- `2026-08-05-llm-vs-agents-vs-agentic-ai.post.md`

| Part | Meaning |
| --- | --- |
| `YYYY-MM-DD` | Editorial date (should match frontmatter `date`) |
| `your-post-slug` | URL-safe kebab-case label |
| `.post.md` | Required suffix so the file is included |

**Slug derivation:** the loader strips the path and `.post.md` suffix.

Example: `./content/blog/2026-08-05-llm-vs-agents-vs-agentic-ai.post.md`  
→ slug `2026-08-05-llm-vs-agents-vs-agentic-ai`

### 2.4 Frontmatter schema

Every published post starts with YAML-like frontmatter between `---` fences:

```md
---
title: "Your daily post title"
date: "2026-08-05"
excerpt: "One sentence explaining why this post is worth reading."
readTime: "3 min read"
---
```

| Field | Required | Type | Default if missing | Used for |
| --- | --- | --- | --- | --- |
| `title` | Yes | string | `"Untitled post"` | Card heading + reader `<h2>` |
| `date` | Yes | `YYYY-MM-DD` | `"1970-01-01"` | Sort order + displayed date |
| `excerpt` | Yes | string | `""` | Card summary text |
| `readTime` | Yes | string | `"3 min read"` | Card + reader meta line |

Notes:

- Values may be quoted (`"..."`) or unquoted; quotes are stripped by the parser.
- Parsing is intentionally simple (line-based `key: value`), not a full YAML engine.
- Nested YAML / multi-line frontmatter values are **not** supported.
- Sort order is **newest `date` first**.

### 2.5 Body

Everything after the closing `---` is the article body (Markdown).

Supported body features:

| Feature | How | Notes |
| --- | --- | --- |
| Headings, lists, emphasis, links | Standard Markdown | via `react-markdown` |
| Tables | GFM pipe tables | via `remark-gfm`; mobile stacks into labeled cards |
| Blockquotes | `>` | Styled callout bar |
| Inline / fenced code | `` `code` `` / ` ``` ` | Dark code blocks |
| Journal visuals | Empty/named fences like ` ```stack ` | Mapped to React components |

### 2.6 In-memory post object

After parse, each post is:

```js
{
  slug: "2026-08-05-llm-vs-agents-vs-agentic-ai",
  title: "LLM vs Agents vs Agentic AI: a builder’s map",
  date: "2026-08-05",
  excerpt: "Three terms get mixed constantly...",
  readTime: "8 min read",
  body: "## The stack at a glance\n..."  // Markdown without frontmatter
}
```

Exported as:

- `blogPosts` — sorted array (newest first)
- `displayDate(date)` — formats `YYYY-MM-DD` as e.g. `5 August 2026`

---

## 3. Creating a journal post (data path)

There is **no “Create journal” screen in the product UI**. Authors create posts in the repo.

### 3.1 Step-by-step

1. Copy the template:

   ```bash
   cp frontend/src/content/blog/POST_TEMPLATE.md \
      frontend/src/content/blog/YYYY-MM-DD-your-post-slug.post.md
   ```

2. Edit frontmatter:
   - Set `title`, `date`, `excerpt`, `readTime`
   - Keep `date` aligned with the filename date

3. Write the Markdown body.
   - Prefer one clear idea, short sections, a practical “Try this”
   - For diagrams, use visual fences (see §4) instead of wide ASCII art

4. Preview locally:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Open the site → scroll to **Daily journal** → open the new card.

5. Commit on a branch, open a PR, merge to `main`.

6. Vercel builds and deploys production. The new card appears automatically after deploy (hard-refresh if needed).

### 3.2 Checklist before merge

- [ ] Filename ends with `.post.md`
- [ ] Frontmatter has `title`, `date`, `excerpt`, `readTime`
- [ ] `date` is `YYYY-MM-DD` and matches the filename date
- [ ] Excerpt is one sentence (shows on the card)
- [ ] Body renders without broken tables / missing visuals
- [ ] Mobile: open the reader and confirm tables/visuals are readable

### 3.3 Editing / deleting

| Action | How |
| --- | --- |
| Edit a post | Change the `.post.md` file, merge to `main` |
| Unpublish | Rename/remove the file so it no longer matches `*.post.md`, or delete it |
| Reorder | Change `date` values (sort is by date, not filename alone) |

---

## 4. Journal visuals (special Markdown)

Wide ASCII diagrams break on mobile. The reader maps named fenced code blocks to responsive React visuals in `JournalVisuals.jsx`.

### 4.1 How it works

1. Author writes a fence whose language is a visual key, e.g.:

   ````md
   ```stack
   ```
   ````

2. `MarkdownCode` in `App.jsx` detects `language-stack` (or `language-viz-stack`).
3. If it matches a known visual, it renders `<JournalVisual type="stack" />` instead of a `<pre>`.
4. CSS classes under `.viz-*` style desktop and mobile layouts.

### 4.2 Available visual keys

| Fence language | Visual |
| --- | --- |
| `stack` | Nested Agentic AI → Agent → LLM layers |
| `prompt` | You → LLM → You flow |
| `loop` | Goal → plan → act → check → result |
| `handoff` | Multi-agent handoff + approval |
| `levels` | LLM only / single agent / agentic system cards |
| `decide` | Decision questions for choosing a layer |
| `labels` | Think / Act / Coord cards |
| `single` | One goal / one loop / one tool belt |
| `multi` | Specialists + orchestrator |
| `one-enough` | Decision filter before splitting agents |
| `two-evals` | End-to-end vs contract / step eval layers |
| `trace` | Plan → act → check → recover → gate |
| `scorecard` | Five-metric run scorecard |

Aliases: `viz-stack`, `viz-loop`, etc. also work.

### 4.3 Adding a new visual

1. Add a JSX block to `VISUALS` in `JournalVisuals.jsx`.
2. Add/extend CSS under `.viz-*` in `styles.css` (include a mobile rule if needed).
3. Reference it from a post with ` ```your-key `.

---

## 5. UI path (how readers see journals)

### 5.1 Navigation

- Header link: **Daily journal** → `#journal`
- Section id: `journal`

### 5.2 Listing (`#journal`)

Rendered from `blogPosts.map(...)`.

Each **journal card** shows:

- Formatted date · read time (`.journal-meta`)
- Title (`<h3>`)
- Excerpt (`<p>`)
- **Read the note →** button (sets `selectedPost`)

Layout:

- Desktop: 3-column grid (`.journal-grid`)
- Mobile (≤800px): single column

Section chrome:

- Eyebrow: “The Omnivibe daily journal”
- Heading: “One useful AI idea, every day.”
- Intro copy under `.section-intro`

### 5.3 Reader overlay

When `selectedPost` is set:

1. A fixed `.post-overlay` covers the viewport (opaque dark / solid surface on mobile).
2. `.post-reader` shows meta, title, and Markdown body.
3. Close (`×`) clears `selectedPost`.
4. `useEffect` sets `document.body.style.overflow = "hidden"` while open (restores on close).

Accessibility:

- `role="dialog"`, `aria-modal="true"`, `aria-label={title}`
- Close button has `aria-label="Close article"`

### 5.4 Markdown rendering pipeline

```text
selectedPost.body
  → ReactMarkdown
      + remarkGfm          (tables, strikethrough, autolinks, etc.)
      + MarkdownTable      (wrap + data-label for mobile cards)
      + MarkdownPre/Code   (visuals OR normal <pre><code>)
```

**Tables**

- Desktop: scrollable styled table (dark header, zebra rows)
- Mobile: each row becomes a card; cells show `data-label` from the header row

**Mobile reader**

- Full-bleed panel (`border-radius` only on top)
- Tighter padding / title size
- Visual chip rows stack vertically
- Level/label grids become one column

### 5.5 State summary

| State | Source | UI effect |
| --- | --- | --- |
| `blogPosts` | build-time module | Cards in `#journal` |
| `selectedPost` | React `useState` | `null` = closed; object = overlay open |
| `menuOpen` | React `useState` | Mobile nav (unrelated except journal anchor) |

No journal state is persisted to localStorage, cookies, or a backend.

---

## 6. File inventory

| File | Responsibility |
| --- | --- |
| `frontend/src/content/blog/*.post.md` | Post content (data) |
| `frontend/src/content/blog/POST_TEMPLATE.md` | Authoring template (not published) |
| `frontend/src/blogPosts.js` | Glob, parse frontmatter, sort, `displayDate` |
| `frontend/src/JournalVisuals.jsx` | Named visual components + helpers |
| `frontend/src/App.jsx` | Journal section UI, overlay, Markdown component wiring |
| `frontend/src/styles.css` | `.journal-*`, `.post-*`, `.viz-*`, mobile overrides |
| `frontend/package.json` | `react-markdown`, `remark-gfm` dependencies |
| `README.md` | Short publishing steps (points authors at this flow) |

---

## 7. Build & deploy

### 7.1 Local

```bash
cd frontend
npm install
npm run dev      # hot reload; new .post.md files appear after Vite picks them up
npm run build    # production bundle with posts embedded
npm run preview  # serve dist/
```

### 7.2 Production (Vercel)

1. Merge PR into `main`
2. Vercel runs the frontend build
3. Markdown posts are compiled into the JS bundle
4. Site serves the updated journal section

No separate “publish journal” API call is required.

### 7.3 Docker (single container)

`Dockerfile` builds the frontend (`npm run build`), copies `frontend/dist` into the Python image, and serves the static app via the backend. Journal content is whatever was present at **image build** time.

---

## 8. What does not exist (yet)

Documented explicitly so future work does not assume it:

| Capability | Status |
| --- | --- |
| Admin / CMS UI to create posts | Not implemented |
| REST/GraphQL journal API | Not implemented |
| Database table for posts | Not implemented |
| Draft vs published workflow in product | Not implemented (Git branches/PRs only) |
| Per-post routes (`/journal/:slug`) | Not implemented (overlay only) |
| Search / tags / categories | Not implemented |
| Authored-by / avatar metadata | Not implemented |
| Analytics hooks per post | Not implemented |

To add a “create from UI” flow later, you would typically:

1. Store posts in a DB or headless CMS (or write files via a privileged API)
2. Add an authenticated author form
3. Replace or supplement `import.meta.glob` with a fetch/loader
4. Keep the same card + overlay UI against the same post shape (`title`, `date`, `excerpt`, `readTime`, `body`, `slug`)

---

## 9. Quick reference — create a post today

```bash
# 1. New file from template
cp frontend/src/content/blog/POST_TEMPLATE.md \
   frontend/src/content/blog/$(date +%F)-my-idea.post.md

# 2. Edit frontmatter + body in your editor

# 3. Preview
cd frontend && npm run dev

# 4. Ship
git add frontend/src/content/blog/*.post.md
git commit -m "Add journal post: my idea"
# open PR → merge to main → Vercel deploys
```

---

## 10. Related product copy

On the live homepage, the journal is framed as:

> **The Omnivibe daily journal**  
> One useful AI idea, every day.  
> Short notes for curious learners and builders.

Keep new posts aligned with that tone: one useful idea, clear language, practical next step.
