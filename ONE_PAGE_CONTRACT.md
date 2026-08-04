# One-Page Project Contract (Client Summary)

## Project
Build an original AI education and technical media website, inspired by market best practices, with separate frontend and backend codebases and a single-file deployment entry.

## What You Will Receive
- A **Node.js frontend** (`/frontend`) for UI
- A **Python backend** (`/backend`) for API and server logic
- A root **`Dockerfile`** to deploy everything as one service
- Documentation for local run + deployment

## Delivery Principles
1. **Original content only** (no direct copy from third-party websites)
2. **Distinct branding and design expression**
3. **Production-ready folder separation** for scale and maintainability
4. **Single deployment artifact** for easier operations

## Current API Deliverables
- `GET /api/health` → `{ "status": "ok" }`
- `GET /api/message` → `{ "message": "Welcome to your AI education platform." }`

## Deployment Method
```bash
docker build -t forgewithai-app .
docker run --rm -p 8000:8000 forgewithai-app
```

App URL: `http://localhost:8000`

## Acceptance Checklist
- App builds successfully via Docker
- App runs from the single root `Dockerfile`
- Frontend loads at `/`
- Health route works at `/api/health`
- Content is original and not copied verbatim

## Legal and IP Safety
- We follow anti-plagiarism and brand-differentiation rules.
- Final legal review remains with the client.

## Change Requests
Any additional feature (payments, auth, analytics, dashboards, etc.) will be added through a documented scope update.

---
**Version:** 1.0  
**Date:** 2026-08-04  
**Status:** Active
