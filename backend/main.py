import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field

from backend.profiling import ProfileError, profile_csv

app = FastAPI(title="Omnivibe API")
ENQUIRY_RECIPIENT = "akshayush007@gmail.com"


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/message")
def message() -> dict[str, str]:
    return {"message": "Welcome to Omnivibe."}


class ContactRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100, pattern=r"^[^\r\n]+$")
    email: EmailStr
    message: str = Field(min_length=10, max_length=2_000)
    projectType: str | None = Field(default=None, max_length=80, pattern=r"^[^\r\n]*$")
    timeline: str | None = Field(default=None, max_length=80, pattern=r"^[^\r\n]*$")
    budget: str | None = Field(default=None, max_length=80, pattern=r"^[^\r\n]*$")
    stack: str | None = Field(default=None, max_length=300)


def build_enquiry_body(request: ContactRequest) -> str:
    """Render one enquiry as plain text, including any qualifying answers."""
    lines = [
        "New Omnivibe enquiry",
        "",
        f"Name: {request.name}",
        f"Email: {request.email}",
    ]

    qualifiers = (
        ("Project type", request.projectType),
        ("Timeline", request.timeline),
        ("Budget", request.budget),
        ("Current stack", request.stack),
    )
    for label, value in qualifiers:
        if value and value.strip():
            lines.append(f"{label}: {value.strip()}")

    lines.extend(["", "Message:", request.message, ""])
    return "\n".join(lines)


def send_enquiry_email(request: ContactRequest) -> None:
    """Deliver one validated enquiry using SMTP credentials from the environment."""
    host = os.environ.get("SMTP_HOST")
    username = os.environ.get("SMTP_USERNAME")
    password = os.environ.get("SMTP_PASSWORD")
    sender = os.environ.get("SMTP_FROM", username or "")
    if not all((host, username, password, sender)):
        raise HTTPException(
            status_code=503,
            detail="Enquiry email service is unavailable. Please try again later.",
        )

    try:
        port = int(os.environ.get("SMTP_PORT", "587"))
    except ValueError as error:
        raise HTTPException(status_code=503, detail="Enquiry email service is unavailable. Please try again later.") from error

    email = EmailMessage()
    email["Subject"] = f"OMNIVIBE ENQUIRY — {request.name.strip()}"
    email["From"] = sender
    email["To"] = ENQUIRY_RECIPIENT
    email["Reply-To"] = str(request.email)
    email.set_content(build_enquiry_body(request))

    try:
        if os.environ.get("SMTP_USE_SSL", "").lower() in {"1", "true", "yes"}:
            with smtplib.SMTP_SSL(host, port, timeout=15) as client:
                client.login(username, password)
                client.send_message(email)
        else:
            with smtplib.SMTP(host, port, timeout=15) as client:
                client.starttls()
                client.login(username, password)
                client.send_message(email)
    except (OSError, smtplib.SMTPException) as error:
        raise HTTPException(
            status_code=502,
            detail="We could not send your enquiry. Please try again later.",
        ) from error


@app.post("/api/contact", status_code=202)
def contact(request: ContactRequest) -> dict[str, str]:
    send_enquiry_email(request)
    return {"message": "Thanks — your enquiry has been sent."}


@app.post("/api/demo/profile")
async def profile_dataset(request: Request) -> dict[str, object]:
    """Profile a small CSV posted as a raw body. Data is parsed in memory and discarded."""
    raw = await request.body()
    filename = request.headers.get("x-filename", "dataset.csv")[:120]
    try:
        return profile_csv(raw, filename=filename)
    except ProfileError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{path_name:path}")
    def spa_fallback(path_name: str) -> FileResponse:
        _ = path_name
        return FileResponse(frontend_dist / "index.html")
