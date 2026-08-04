#!/usr/bin/env python3
"""Render a project.json package into a vertical MP4 with readable lesson cards."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SIZE = (1080, 1920)
COLORS = [("#0d1b2a", "#00b4d8"), ("#240046", "#c77dff"), ("#003049", "#f77f00"), ("#004b23", "#80ed99"), ("#3d0000", "#ffba08")]


def font(size: int) -> ImageFont.FreeTypeFont:
    for candidate in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans.ttf"):
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    raise RuntimeError("DejaVu Sans is required to render text cards.")


def centered_block(draw: ImageDraw.ImageDraw, text: str, y: int, width: int, fill: str, typeface: ImageFont.FreeTypeFont) -> int:
    lines = textwrap.wrap(text, width=width) or [text]
    for line in lines:
        box = draw.textbbox((0, 0), line, font=typeface)
        draw.text(((SIZE[0] - (box[2] - box[0])) / 2, y), line, font=typeface, fill=fill)
        y += (box[3] - box[1]) + 22
    return y


def card(scene: dict, index: int, directory: Path) -> Path:
    start, accent = COLORS[index % len(COLORS)]
    image = Image.new("RGB", SIZE, start)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((80, 120, 1000, 150), radius=15, fill=accent)
    draw.text((80, 210), f"OMNIVIBE  •  LESSON {index + 1}", font=font(34), fill="#e9ecef")
    title_font, body_font = font(86), font(52)
    y = centered_block(draw, scene["title"], 690, 18, "#ffffff", title_font)
    centered_block(draw, scene["body"], y + 95, 31, "#e9ecef", body_font)
    draw.text((80, 1770), "Save this for later  ↗", font=font(38), fill=accent)
    target = directory / f"card-{index:02d}.png"
    image.save(target)
    return target


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Render a generated Reel project.")
    parser.add_argument("project", type=Path, help="Path to project.json")
    parser.add_argument("--output", type=Path, help="MP4 destination (defaults beside project.json)")
    args = parser.parse_args()

    if not shutil.which("ffmpeg"):
        raise SystemExit("ffmpeg is required. Install it, then run this command again.")
    project = json.loads(args.project.read_text(encoding="utf-8"))
    project_dir = args.project.parent
    frame_dir = project_dir / "frames"
    frame_dir.mkdir(exist_ok=True)
    output = args.output or project_dir / "reel.mp4"

    clips: list[Path] = []
    for index, scene in enumerate(project["scenes"]):
        image = card(scene, index, frame_dir)
        clip = frame_dir / f"clip-{index:02d}.mp4"
        run([
            "ffmpeg", "-y", "-loop", "1", "-i", str(image), "-t", str(scene["duration"]),
            "-r", "30", "-vf", "format=yuv420p", "-c:v", "libx264", "-pix_fmt", "yuv420p", str(clip),
        ])
        clips.append(clip)

    manifest = frame_dir / "clips.txt"
    manifest.write_text("".join(f"file '{clip.resolve()}'\n" for clip in clips), encoding="utf-8")
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(manifest), "-c", "copy", str(output)])
    print(f"Rendered {output}")
    print("Review the video before publishing. Add narration/music in an editor if desired.")


if __name__ == "__main__":
    main()
