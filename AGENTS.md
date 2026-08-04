# AGENTS.md

## Cursor Cloud specific instructions

This repo is a small monorepo with two independent products (see `README.md` and `insta workflow/README.md` for the standard commands):

- `frontend/` — React 18 + Vite 5 UI (dev server on port `5173`).
- `backend/` — FastAPI API served by Uvicorn on port `8000`. Also serves the built frontend when `frontend/dist` exists.
- `insta workflow/` — standalone Python CLI (`generate.py` → `render.py` → `publish.py`) that renders Instagram Reel videos with `ffmpeg`.

### Environment (already provisioned by the update script / snapshot)

- Python deps live in per-project virtualenvs: `backend/.venv` and `insta workflow/.venv`. Run their tools via the venv, e.g. `backend/.venv/bin/uvicorn ...`, or `source backend/.venv/bin/activate` first.
- The `python3.12-venv` system package, `ffmpeg`, and DejaVu fonts are present in the snapshot; `render.py` hard-codes DejaVu font paths.

### Running the services

- Backend (dev): `cd backend && ./.venv/bin/uvicorn main:app --reload --port 8000`.
- Frontend (dev): `cd frontend && npm run dev` (serves on `5173`).

### Non-obvious caveats

- The Vite dev server has **no API proxy** (see `vite.config.js`). The contact form calls a relative `fetch("/api/contact")`, so submitting it from the `5173` dev origin will NOT reach the backend on `8000`. To exercise the full UI → API flow, build the frontend (`npm run build`) and open the backend at `http://localhost:8000`, which serves both the UI and the API from one origin.
- The backend only mounts the SPA fallback + `/assets` routes if `frontend/dist` exists **at import time**. If you build the frontend after Uvicorn is already running, trigger a reload (e.g. `touch backend/main.py`) or restart Uvicorn so the static routes register.
- Contact submissions are validated but not persisted (no database); `POST /api/contact` returns `202` on success and `422` on validation errors.
- `insta workflow` output is written to `Insta reels/<slug>/` (gitignored). Publishing (`publish.py`) additionally requires Meta Instagram Graph API credentials and a public HTTPS video URL, so it cannot be run end-to-end here.

### Tests / lint

- There is no automated test suite and no linter configured in this repo.
