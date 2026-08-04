# Omnivibe

## Full-stack website (Node UI + Python backend)

This project keeps frontend and backend in separate folders:

- `frontend/` - React + Vite (Node.js)
- `backend/` - FastAPI (Python)

## Single-file deployment

For deployment, use the root `Dockerfile`. It builds frontend and backend into one runnable container.

### Build

```bash
docker build -t forgewithai-app .
```

### Run

```bash
docker run --rm -p 8000:8000 forgewithai-app
```

Open: `http://localhost:8000`

## Local dev (separate processes)

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```
