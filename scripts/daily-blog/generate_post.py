#!/usr/bin/env python3
"""Generate one Omnivibe Daily Journal Markdown post for a given date.

Publishing path matches the existing site:
  frontend/src/content/blog/YYYY-MM-DD-<slug>.post.md
  → commit/merge to main → Vercel build → live journal card

Usage:
  python3 scripts/daily-blog/generate_post.py
  python3 scripts/daily-blog/generate_post.py --date 2026-08-08
  python3 scripts/daily-blog/generate_post.py --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BLOG_DIR = ROOT / "frontend" / "src" / "content" / "blog"
TOPICS_PATH = Path(__file__).resolve().parent / "topics.json"

ALLOWED_VISUALS = {
    "stack",
    "prompt",
    "loop",
    "handoff",
    "levels",
    "decide",
    "labels",
    "single",
    "multi",
    "one-enough",
    "two-evals",
    "trace",
    "scorecard",
}

SYSTEM_PROMPT = """You write the Omnivibe Daily Journal — short, practical tech posts for builders shipping AI systems.

Voice and rules:
- Company voice: "we", not freelance "I".
- One clear idea per post. No hype, no emoji, no purple marketing prose.
- Plain language. Short sections with ## headings.
- Include at least one concrete table or numbered checklist when it helps.
- Include exactly one journal visual fence: a fenced code block whose language is ONLY the visual key (e.g. ```loop then closing ```) with an empty body.
- End with a ## Try this section and one actionable next step.
- Length target: roughly 700–1100 words.
- Do not invent product metrics or customer names.
- Frontmatter must be valid and use double-quoted values.

Output ONLY the full Markdown file including frontmatter. No preamble.
"""


def load_topics() -> list[dict]:
    with TOPICS_PATH.open(encoding="utf-8") as handle:
        topics = json.load(handle)
    if not isinstance(topics, list) or not topics:
        raise SystemExit("topics.json must be a non-empty list")
    return topics


def existing_slugs() -> set[str]:
    slugs: set[str] = set()
    if not BLOG_DIR.exists():
        return slugs
    for path in BLOG_DIR.glob("*.post.md"):
        name = path.name[: -len(".post.md")]
        # YYYY-MM-DD-slug
        match = re.match(r"^\d{4}-\d{2}-\d{2}-(.+)$", name)
        if match:
            slugs.add(match.group(1))
        else:
            slugs.add(name)
    return slugs


def posts_for_date(day: date) -> list[Path]:
    prefix = day.isoformat()
    return sorted(BLOG_DIR.glob(f"{prefix}-*.post.md"))


def pick_topic(topics: list[dict], used: set[str]) -> dict:
    for topic in topics:
        slug = topic.get("slug")
        if not slug:
            continue
        if slug not in used:
            return topic
    raise SystemExit(
        "No unused topics left in topics.json. Add more topics before the next run."
    )


def estimate_read_time(body: str) -> str:
    words = len(re.findall(r"\w+", body))
    minutes = max(3, min(12, round(words / 180) or 3))
    return f"{minutes} min read"


def render_fallback(topic: dict, day: date) -> str:
    visual = topic.get("visual") or "loop"
    if visual not in ALLOWED_VISUALS:
        visual = "loop"
    angles = topic.get("angles") or [
        "Name the constraint before you add more model power",
        "Measure the outcome users feel",
        "Keep a kill switch",
    ]
    angle_lines = "\n".join(f"{index}. {angle}" for index, angle in enumerate(angles, start=1))
    try_this = topic.get("try_this") or "Apply this idea to one live agent this week and write down what changed."
    title = topic["title"]
    excerpt = topic["excerpt"]
    body = f"""## Why this matters today

Shipping AI systems is less about clever prompts and more about **operating constraints**. Today we focus on: **{title}**.

When teams skip this, demos look fine and production quietly burns money, trust, or both.

```{visual}
```

## The practical shape

{angle_lines}

| Move | What good looks like | What to avoid |
| --- | --- | --- |
| Define the job | One success sentence | Vague “be helpful” goals |
| Bound the loop | Caps on tools, time, spend | Unlimited retries |
| Prove it | Traces + a small eval set | Vibes-only launches |

## Builder notes

- Keep the **goal** and **stop conditions** visible in every run.
- Prefer **checks** that can fail closed over hopeful wording in the prompt.
- If a step does not move the success metric, delete it.

## Try this

{try_this}
"""
    read_time = estimate_read_time(body)
    return (
        f'---\n'
        f'title: "{title}"\n'
        f'date: "{day.isoformat()}"\n'
        f'excerpt: "{excerpt}"\n'
        f'readTime: "{read_time}"\n'
        f'---\n\n'
        f'{body.strip()}\n'
    )


def build_user_prompt(topic: dict, day: date) -> str:
    visual = topic.get("visual") or "loop"
    if visual not in ALLOWED_VISUALS:
        visual = "loop"
    angles = "\n".join(f"- {item}" for item in topic.get("angles") or [])
    return f"""Write today's Omnivibe journal post.

Date: {day.isoformat()}
Slug (for your awareness only; do not put in frontmatter): {topic['slug']}
Title: {topic['title']}
Excerpt: {topic['excerpt']}
Required visual fence language: {visual}
Angles to cover:
{angles}
Try-this seed: {topic.get('try_this', '')}

Frontmatter fields required exactly:
title, date, excerpt, readTime

date must be "{day.isoformat()}".
title and excerpt should stay close to the provided copy (light edits OK).
readTime like "6 min read".
"""


def call_openai_compatible(api_key: str, user_prompt: str) -> str:
    base = (os.environ.get("OPENAI_BASE_URL") or "https://api.openai.com/v1").rstrip("/")
    model = os.environ.get("DAILY_BLOG_MODEL") or "gpt-4o-mini"
    payload = {
        "model": model,
        "temperature": 0.55,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    }
    request = urllib.request.Request(
        f"{base}/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "omnivibe-daily-blog/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"LLM HTTP {exc.code}: {detail}") from exc
    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError(f"Unexpected LLM response shape: {data!r}") from exc


def normalize_markdown(raw: str, topic: dict, day: date) -> str:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:markdown|md)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text).strip()

    if not text.startswith("---"):
        return render_fallback(topic, day)

    match = re.match(r"^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$", text)
    if not match:
        return render_fallback(topic, day)

    frontmatter, body = match.group(1), match.group(2).strip()
    fields = {}
    for line in frontmatter.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        fields[key.strip()] = value.strip().strip('"').strip("'")

    title = fields.get("title") or topic["title"]
    excerpt = fields.get("excerpt") or topic["excerpt"]
    read_time = fields.get("readTime") or estimate_read_time(body)
    # Ensure required visual appears once if the model forgot.
    visual = topic.get("visual") or "loop"
    if visual in ALLOWED_VISUALS and f"```{visual}" not in body:
        body = f"```{visual}\n```\n\n" + body

    return (
        f'---\n'
        f'title: "{title}"\n'
        f'date: "{day.isoformat()}"\n'
        f'excerpt: "{excerpt}"\n'
        f'readTime: "{read_time}"\n'
        f'---\n\n'
        f'{body.strip()}\n'
    )


def generate_markdown(topic: dict, day: date) -> tuple[str, str]:
    api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("AI_GATEWAY_API_KEY")
    if api_key:
        try:
            raw = call_openai_compatible(api_key, build_user_prompt(topic, day))
            return normalize_markdown(raw, topic, day), "llm"
        except Exception as exc:  # noqa: BLE001 - fall back to outline post
            print(f"LLM generation failed ({exc}); using outline fallback.", file=sys.stderr)
    return render_fallback(topic, day), "fallback"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--date",
        help="Post date YYYY-MM-DD (default: today UTC)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the Markdown to stdout without writing a file",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Create a post even if one already exists for the date",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.date:
        day = date.fromisoformat(args.date)
    else:
        day = datetime.now(timezone.utc).date()

    BLOG_DIR.mkdir(parents=True, exist_ok=True)
    existing = posts_for_date(day)
    if existing and not args.force:
        print(f"SKIP existing post for {day.isoformat()}: {existing[0].name}")
        return 0

    topics = load_topics()
    topic = pick_topic(topics, existing_slugs())
    markdown, mode = generate_markdown(topic, day)
    out_path = BLOG_DIR / f"{day.isoformat()}-{topic['slug']}.post.md"

    if args.dry_run:
        print(f"# dry-run mode={mode} path={out_path.relative_to(ROOT)}")
        print(markdown)
        return 0

    if out_path.exists() and not args.force:
        print(f"SKIP file already exists: {out_path.name}")
        return 0

    out_path.write_text(markdown, encoding="utf-8")
    # Machine-readable line for GitHub Actions
    print(f"CREATED={out_path.relative_to(ROOT)}")
    print(f"MODE={mode}")
    print(f"SLUG={topic['slug']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
