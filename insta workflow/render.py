#!/usr/bin/env python3
"""Render a project package into a narrated, classroom-style vertical MP4."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SIZE = (1080, 1920)
WALL = "#dff3ff"
INK = "#17324d"
PANEL = "#fffdf8"


def font(size: int) -> ImageFont.FreeTypeFont:
    for candidate in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans.ttf"):
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    raise RuntimeError("DejaVu Sans is required to render text cards.")


def wrapped_block(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, width: int, fill: str, typeface: ImageFont.FreeTypeFont) -> int:
    lines = textwrap.wrap(text, width=width) or [text]
    for line in lines:
        draw.text((x, y), line, font=typeface, fill=fill)
        box = draw.textbbox((x, y), line, font=typeface)
        y += (box[3] - box[1]) + 22
    return y


def draw_teacher(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    """Draw a warm, gender-neutral illustrated classroom teacher."""
    # Body, pointing arm, neck, head, hair, and friendly face.
    draw.rounded_rectangle((x, y + 350, x + 330, y + 720), radius=65, fill="#4267ac")
    draw.polygon([(x + 250, y + 410), (x + 510, y + 320), (x + 530, y + 380), (x + 285, y + 490)], fill="#a66a46")
    draw.ellipse((x + 480, y + 300, x + 545, y + 365), fill="#a66a46")
    draw.rectangle((x + 130, y + 280, x + 205, y + 370), fill="#a66a46")
    draw.ellipse((x + 45, y + 55, x + 305, y + 340), fill="#b97852")
    draw.pieslice((x + 38, y + 25, x + 312, y + 275), 180, 360, fill="#2d1b24")
    draw.ellipse((x + 105, y + 170, x + 126, y + 193), fill="#17324d")
    draw.ellipse((x + 220, y + 170, x + 241, y + 193), fill="#17324d")
    draw.arc((x + 145, y + 195, x + 210, y + 260), 5, 175, fill="#7f3541", width=7)
    draw.polygon([(x + 80, y + 370), (x + 165, y + 490), (x + 250, y + 370)], fill="#ffffff")
    draw.rectangle((x + 145, y + 445, x + 185, y + 720), fill="#f4bf2a")


def classroom(scene: dict, index: int, directory: Path) -> Path:
    image = Image.new("RGB", SIZE, WALL)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 1500, 1080, 1920), fill="#f7d7a8")
    draw.rounded_rectangle((70, 100, 1010, 560), radius=35, fill="#1d513d", outline="#9b693c", width=28)
    draw.text((125, 160), "MINI AI CLASS", font=font(42), fill="#f9f3d6")
    draw.text((125, 245), f"Lesson {index + 1}", font=font(32), fill="#bae8cb")
    draw.rounded_rectangle((390, 680, 1010, 1400), radius=45, fill=PANEL, outline="#b8d9ea", width=8)
    title_font, body_font = font(62), font(42)
    y = wrapped_block(draw, scene["title"], 455, 755, 16, INK, title_font)
    wrapped_block(draw, scene["body"], 455, y + 70, 24, "#35546e", body_font)
    draw.polygon([(450, 1210), (365, 1300), (465, 1290)], fill=PANEL)
    draw_teacher(draw, 60 if index % 2 == 0 else 90, 920)
    draw.rounded_rectangle((70, 1735, 1010, 1840), radius=35, fill="#f4bf2a")
    draw.text((125, 1765), "Listen, learn, and ask questions!", font=font(37), fill=INK)
    target = directory / f"classroom-{index:02d}.png"
    image.save(target)
    return target


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def duration(path: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def narration_audio(text: str, index: int, directory: Path) -> Path:
    text_path = directory / f"speech-{index:02d}.txt"
    audio_path = directory / f"speech-{index:02d}.m4a"
    text_path.write_text(text, encoding="utf-8")
    filter_path = str(text_path.resolve()).replace("\\", "\\\\").replace(":", "\\:")
    run([
        "ffmpeg", "-y", "-f", "lavfi", "-i", f"flite=textfile='{filter_path}':voice=slt",
        "-c:a", "aac", "-b:a", "128k", str(audio_path),
    ])
    return audio_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Render a generated Reel project.")
    parser.add_argument("project", type=Path, help="Path to project.json")
    parser.add_argument("--output", type=Path, help="MP4 destination (defaults beside project.json)")
    args = parser.parse_args()

    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise SystemExit("ffmpeg and ffprobe are required. Install ffmpeg, then run this command again.")
    project = json.loads(args.project.read_text(encoding="utf-8"))
    project_dir = args.project.parent
    frame_dir = project_dir / "frames"
    frame_dir.mkdir(exist_ok=True)
    output = args.output or project_dir / "reel.mp4"

    clips: list[Path] = []
    for index, scene in enumerate(project["scenes"]):
        image = classroom(scene, index, frame_dir)
        audio = narration_audio(f"{scene['title']}. {scene['body']}", index, frame_dir)
        clip_duration = max(float(scene["duration"]), duration(audio) + 0.5)
        clip = frame_dir / f"clip-{index:02d}.mp4"
        run([
            "ffmpeg", "-y", "-loop", "1", "-i", str(image), "-i", str(audio),
            "-filter_complex", f"[1:a]apad=pad_dur={clip_duration}[a]",
            "-map", "0:v", "-map", "[a]", "-t", str(clip_duration), "-r", "30",
            "-vf", "scale=1134:2016,zoompan=z='min(zoom+0.0005,1.05)':d=1:s=1080x1920:fps=30,format=yuv420p",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", str(clip),
        ])
        clips.append(clip)

    manifest = frame_dir / "clips.txt"
    manifest.write_text("".join(f"file '{clip.resolve()}'\n" for clip in clips), encoding="utf-8")
    run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(manifest),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", str(output),
    ])
    print(f"Rendered {output}")
    print("Review the narrated, illustrated-teacher video before publishing.")


if __name__ == "__main__":
    main()
