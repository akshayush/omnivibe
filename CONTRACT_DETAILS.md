# Project Contract Details

## 1) Parties and Purpose

- **Client**: Website owner / requesting party
- **Delivery Team**: Implementation provider
- **Project Goal**: Build an original AI education + technical media website inspired by market structure, without copying protected creative expression from any third-party website.

---

## 2) Scope of Work

### In Scope

1. **Frontend Application (Node.js stack)**
   - React + Vite UI in `/frontend`
   - Responsive landing experience
   - API integration with backend routes

2. **Backend Application (Python stack)**
   - FastAPI service in `/backend`
   - Core health and message endpoints
   - Static hosting support for built frontend assets

3. **Single-file Deployment Entry**
   - Root `Dockerfile` as the single deployment artifact
   - One-container runtime serving both UI and API

4. **Documentation**
   - Setup, local development, and deployment guidance in `README.md`
   - This contract document for technical and delivery alignment

### Out of Scope (unless added by change request)

- Payment gateway integration
- Multi-tenant user management
- Advanced analytics dashboards
- Native mobile apps
- Legal representation/advice in court disputes

---

## 3) Technical Architecture Contract

## Directory Contract

```text
/frontend   -> Node.js (React + Vite)
/backend    -> Python (FastAPI)
/Dockerfile -> single deployment entry file
```

## Runtime Contract

- Container exposes port `8000`
- Backend process (`uvicorn`) is the runtime entrypoint
- Backend serves:
  - API under `/api/*`
  - Frontend static bundle under `/`

## Compatibility Contract

- Frontend expects backend on same origin in production (`/api/...`)
- No CORS complexity required in single-container production mode

---

## 4) API Contract (Current)

## `GET /api/health`

### Response (200)
```json
{ "status": "ok" }
```

## `GET /api/message`

### Response (200)
```json
{ "message": "Welcome to your AI education platform." }
```

### API Stability Notes

- Response keys above are treated as stable for current release.
- Any breaking change should increment API versioning strategy (example: `/api/v2/...`) or be approved before release.

---

## 5) Deployment Contract

## Build Contract

```bash
docker build -t omnivibe-app .
```

## Run Contract

```bash
docker run --rm -p 8000:8000 omnivibe-app
```

## Service Availability Contract

- App should be reachable at `http://<host>:8000`
- Health endpoint should return 200 at `/api/health`

---

## 6) Content, Copyright, and Brand Safety Contract

1. **Original Content Requirement**
   - All website copy must be rewritten in original language.
   - No direct sentence-level copying from third-party websites.

2. **Design Differentiation Requirement**
   - Maintain distinct brand identity (name, typography usage, color system, layout nuances).
   - Reuse only common industry patterns (hero, CTA, cards), not unique protected creative assets.

3. **Asset Ownership Requirement**
   - Any logos, images, icons, and media used in production must be licensed, client-owned, or created for this project.

4. **Trademark Safety**
   - Avoid use of confusingly similar brand marks, names, or trade dress.

5. **Legal Disclaimer**
   - This document provides implementation safeguards, not legal advice.
   - Final legal review remains the client’s responsibility.

---

## 7) Security and Operations Contract

- Keep dependencies updated to current stable versions during active development.
- Never hardcode production secrets in source files.
- Use environment variables for API keys, database URLs, and credentials.
- Restrict CORS in production when deploying cross-origin architectures.

---

## 8) Acceptance Criteria

Project is considered accepted when:

1. `docker build` completes successfully.
2. `docker run` launches app successfully on port `8000`.
3. `/api/health` responds with `{ "status": "ok" }`.
4. Frontend loads at `/` and can fetch `/api/message`.
5. Content is original and not copied verbatim from referenced websites.

---

## 9) Change Management Contract

- Any new features beyond scope require a documented change request.
- Change request should specify:
  - Feature description
  - Impacted modules (`frontend`, `backend`, deployment)
  - Contract/API changes
  - Additional acceptance criteria

---

## 10) Version Record

- **Contract Version**: 1.0
- **Date**: 2026-08-04
- **Status**: Active
