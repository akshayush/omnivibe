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

## Enquiry email delivery

The contact form sends each enquiry to `akshayush007@gmail.com`. Configure these environment variables in Vercel (or your container host); never commit the SMTP password:

```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password-or-app-password
SMTP_FROM=sender@example.com
```

For providers that require implicit TLS on port 465, also set `SMTP_USE_SSL=true`. Otherwise the application uses STARTTLS. All delivered email subjects begin with `OMNIVIBE ENQUIRY`.

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
