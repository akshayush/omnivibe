# Daily journal automation

Generates one Omnivibe Daily Journal post per day as a Markdown file under
`frontend/src/content/blog/`. Once that file reaches `main`, Vercel deploys and
the post appears in the site journal.

## Quick start

```bash
# Preview without writing a file
python3 scripts/daily-blog/generate_post.py --dry-run --date 2026-08-08

# Write the file locally
python3 scripts/daily-blog/generate_post.py --date 2026-08-08
```

## How it goes live

1. GitHub Actions runs on a daily cron (`0 3 * * *` UTC = **08:30 IST**) or via **Actions → Daily journal post → Run workflow**.
2. `generate_post.py` picks the next unused topic from `topics.json`.
3. If `OPENAI_API_KEY` is set, it drafts a full post with the LLM. Otherwise it writes a solid outline-based post from the topic angles.
4. Default mode **publish** commits the `.post.md` file to `main`.
5. Vercel builds `main` and the journal card is live.

Set repository variable `DAILY_BLOG_MODE=pr` (or choose **pr** in a manual run) to open a review pull request instead of pushing to `main`.

## Secrets and variables

| Name | Type | Required | Purpose |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Actions secret | No | Enables LLM drafting. Without it, outline fallback posts still publish. |
| `OPENAI_BASE_URL` | Actions secret | No | Optional OpenAI-compatible base URL (default `https://api.openai.com/v1`). |
| `DAILY_BLOG_MODEL` | Actions variable | No | Model id (default `gpt-4o-mini`). |
| `DAILY_BLOG_MODE` | Actions variable | No | `publish` (default) or `pr`. |

## Topic queue

Edit `topics.json` to add more posts. Each item needs:

- `slug` — kebab-case; becomes part of the filename
- `title`, `excerpt`
- `visual` — one of the journal visual fence keys (`loop`, `trace`, `scorecard`, …)
- `angles` — 3 bullets the post should cover
- `try_this` — one concrete next step

When every slug has already been published, the workflow fails until you add new topics.

## Safety

- Idempotent: if a `YYYY-MM-DD-*.post.md` already exists for the run date, the job skips.
- Only `*.post.md` files are published by the site loader.
- Review mode (`pr`) is available when you want a human gate before going live.
