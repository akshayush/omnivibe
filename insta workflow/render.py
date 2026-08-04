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
INK = "#10233e"
CYAN = "#00cbed"
NAVY = "#10233e"
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


def concept_visual(draw: ImageDraw.ImageDraw, index: int) -> None:
    """Draw one simple, visual-first explanation instead of a dense text slide."""
    if index == 0:
        draw.rounded_rectangle((135, 560, 610, 700), radius=38, fill="#ffffff")
        draw.text((185, 600), "Can AI talk?", font=font(46), fill=NAVY)
        draw.rounded_rectangle((470, 755, 945, 895), radius=38, fill=CYAN)
        draw.text((520, 795), "Yes. Like this!", font=font(42), fill=NAVY)
    elif index == 1:
        for x, label in ((165, "books"), (365, "stories"), (565, "web pages")):
            draw.rounded_rectangle((x, 585, x + 150, 790), radius=20, fill="#ffffff")
            draw.rectangle((x + 20, 620, x + 130, 650), fill=CYAN)
            draw.text((x + 28, 695), label, font=font(25), fill=NAVY)
        draw.polygon([(745, 690), (825, 635), (905, 690), (825, 750)], fill=CYAN)
        draw.text((755, 810), "patterns", font=font(32), fill="#ffffff")
    elif index == 2:
        words = ("The", "cat", "sat")
        for position, word in enumerate(words):
            x = 125 + position * 225
            draw.rounded_rectangle((x, 650, x + 155, 790), radius=28, fill="#ffffff")
            draw.text((x + 32, 700), word, font=font(39), fill=NAVY)
            if position < 2:
                draw.text((x + 165, 695), "→", font=font(48), fill=CYAN)
        draw.rounded_rectangle((775, 650, 960, 790), radius=28, fill=CYAN)
        draw.text((810, 700), "next?", font=font(39), fill=NAVY)
    elif index == 3:
        for y, label in ((555, "summarize"), (700, "translate"), (845, "brainstorm")):
            draw.rounded_rectangle((180, y, 900, y + 105), radius=28, fill="#ffffff")
            draw.ellipse((210, y + 27, 260, y + 77), fill=CYAN)
            draw.text((300, y + 31), label, font=font(42), fill=NAVY)
    else:
        draw.rounded_rectangle((145, 570, 945, 880), radius=42, fill="#ffffff")
        draw.text((220, 630), "AI can help,", font=font(58), fill=NAVY)
        draw.text((220, 720), "but check facts!", font=font(58), fill=CYAN)
        draw.ellipse((780, 665, 860, 745), outline=NAVY, width=14)
        draw.line((840, 725, 910, 805), fill=NAVY, width=14)


def classroom(scene: dict, index: int, directory: Path) -> Path:
    image = Image.new("RGB", SIZE, "#ffffff")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 1080, 20), fill=CYAN)
    draw.rounded_rectangle((70, 75, 510, 145), radius=20, fill=CYAN)
    draw.text((100, 94), "AI EXPLAINED SIMPLY", font=font(29), fill=NAVY)
    draw.text((75, 205), f"{index + 1:02d}", font=font(46), fill=CYAN)
    title_font = font(74)
    wrapped_block(draw, scene["title"], 155, 190, 20, INK, title_font)
    draw.rounded_rectangle((70, 475, 1010, 1035), radius=42, fill=NAVY)
    concept_visual(draw, index)
    draw.rounded_rectangle((385, 1145, 1010, 1585), radius=38, fill="#e7f9fd")
    body_font = font(44)
    wrapped_block(draw, scene["body"], 445, 1200, 24, INK, body_font)
    draw.polygon([(450, 1420), (365, 1500), (470, 1490)], fill="#e7f9fd")
    draw_teacher(draw, 60, 1030)
    draw.rounded_rectangle((70, 1740, 1010, 1845), radius=30, fill=CYAN)
    footer = "Save this mini lesson  ↗" if index == 4 else "Swipe your mind: one idea at a time"
    draw.text((118, 1770), footer, font=font(36), fill=NAVY)
    target = directory / f"lesson-{index:02d}.png"
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
