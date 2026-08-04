# Omnivibe

## Full-stack website (Node UI + Python backend)

This project keeps frontend and backend in separate folders:

- `frontend/` - React + Vite (Node.js)
- `backend/` - FastAPI (Python)

## Single-file deployment

For deployment, use the root `Dockerfile`. It builds frontend and backend into one runnable container.

### Build

```bash
docker build -t omnivibe-app .
```

### Run

```bash
docker run --rm -p 8000:8000 omnivibe-app
```

Open: `http://localhost:8000`

## Enquiry email delivery

The contact form sends each enquiry to `akshayush007@gmail.com`. Configure these environment variables in Vercel (or your container host); never commit the SMTP password. A missing configuration deliberately returns HTTP `503` instead of falsely confirming delivery.

```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password-or-app-password
SMTP_FROM=sender@example.com
```

For providers that require implicit TLS on port 465, also set `SMTP_USE_SSL=true`. Otherwise the application uses STARTTLS. All delivered email subjects begin with `OMNIVIBE ENQUIRY`.

### Vercel + Gmail setup

1. In Google Account security, enable two-step verification and create an [App Password](https://myaccount.google.com/apppasswords) for Mail. Do not use your regular Google password.
2. In Vercel, open **Omnivibe → Settings → Environment Variables**. Add the following values for **Production**, **Preview**, and **Development**:

   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USE_SSL=true
   SMTP_USERNAME=akshayush007@gmail.com
   SMTP_PASSWORD=<the 16-character Google App Password>
   SMTP_FROM=akshayush007@gmail.com
   ```

3. Redeploy the latest `main` deployment after saving the variables.
4. Submit the contact form, then check `akshayush007@gmail.com` for an email whose subject begins `OMNIVIBE ENQUIRY`.

The password value is intentionally not stored in this repository or exposed by the application.

## Daily blog publishing

The OMNIVIBE Daily Journal is published from Markdown files in `frontend/src/content/blog/`.

1. Copy `POST_TEMPLATE.md` and name the new file `YYYY-MM-DD-your-post-slug.post.md`.
2. Fill in the title, date, excerpt, and reading time in the frontmatter.
3. Write the post body in Markdown.
4. Commit and merge the post into `main`. Vercel builds and publishes it automatically.

Only files ending in `.post.md` are published. `POST_TEMPLATE.md` is a writing reference and is not shown on the site.

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
