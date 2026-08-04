from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field

app = FastAPI(title="ForgeWithAI API")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/message")
def message() -> dict[str, str]:
    return {"message": "Welcome to your AI education platform."}


class ContactRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    message: str = Field(min_length=10, max_length=2_000)


@app.post("/api/contact", status_code=202)
def contact(request: ContactRequest) -> dict[str, str]:
    """Accept a validated inquiry; connect this to a CRM or email provider in production."""
    _ = request
    return {"message": "Thanks — your inquiry has been received."}


frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{path_name:path}")
    def spa_fallback(path_name: str) -> FileResponse:
        _ = path_name
        return FileResponse(frontend_dist / "index.html")
