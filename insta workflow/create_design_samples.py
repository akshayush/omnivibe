#!/usr/bin/env python3
"""Create two review-only visual directions for an AI lesson."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

NAVY = "#10233e"
CYAN = "#00cbed"
PURPLE = "#7d5ba6"
WHITE = "#ffffff"


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], color: str, radius: int = 28) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=color)


def reel_sample(source: Path, output: Path) -> None:
    image = Image.open(source).convert("RGB").resize((1080, 1920))
    draw = ImageDraw.Draw(image, "RGBA")
    rounded(draw, (55, 65, 1005, 385), (255, 255, 255, 242), 36)
    rounded(draw, (85, 95, 400, 157), CYAN, 18)
    draw.text((112, 108), "AI EXPLAINED", font=font(27), fill=NAVY)
    draw.text((85, 185), "Why can AI", font=font(76), fill=NAVY)
    draw.text((85, 265), "talk to you?", font=font(76), fill=NAVY)
    rounded(draw, (465, 900, 1020, 1410), (16, 35, 62, 244), 34)
    draw.text((505, 950), "THE SIMPLE IDEA", font=font(27), fill=CYAN)
    for x, label in ((500, "your words"), (670, "patterns"), (840, "answer")):
        rounded(draw, (x, 1065, x + 125, 1175), WHITE, 20)
        draw.text((x + 16, 1100), label, font=font(18), fill=NAVY)
    draw.text((630, 1080), "→", font=font(36), fill=CYAN)
    draw.text((800, 1080), "→", font=font(36), fill=CYAN)
    draw.text((505, 1230), "It learns patterns in", font=font(37), fill=WHITE)
    draw.text((505, 1280), "language—then predicts", font=font(37), fill=WHITE)
    draw.text((505, 1330), "what could come next.", font=font(37), fill=WHITE)
    rounded(draw, (55, 1740, 1025, 1855), CYAN, 28)
    draw.text((120, 1775), "One clear idea. One visual. No jargon.", font=font(35), fill=NAVY)
    image.save(output)


def carousel_sample(output: Path) -> None:
    image = Image.new("RGB", (1080, 1080), WHITE)
    draw = ImageDraw.Draw(image)
    rounded(draw, (55, 55, 335, 112), CYAN, 16)
    draw.text((80, 68), "AI EXPLAINED", font=font(24), fill=NAVY)
    draw.text((55, 165), "How ChatGPT turns", font=font(61), fill=NAVY)
    draw.text((55, 235), "text into answers", font=font(61), fill=NAVY)
    draw.text((55, 320), "A simple map of a complex idea", font=font(29), fill="#52657c")
    items = [
        ("1", "Your question", "“Why is the sky blue?”", "#dff8fc"),
        ("2", "Tokens", "Text becomes small pieces", "#eee5f7"),
        ("3", "Patterns", "The model checks context", "#e6f5eb"),
        ("4", "Next text", "It predicts a likely reply", "#fff0d1"),
    ]
    for row, (number, title, detail, color) in enumerate(items):
        y = 400 + row * 125
        rounded(draw, (55, y, 1025, y + 95), color, 24)
        rounded(draw, (75, y + 17, 135, y + 77), NAVY, 16)
        draw.text((94, y + 25), number, font=font(29), fill=WHITE)
        draw.text((170, y + 17), title, font=font(32), fill=NAVY)
        draw.text((430, y + 24), detail, font=font(25), fill="#43566d")
    rounded(draw, (55, 930, 1025, 1035), PURPLE, 28)
    draw.text((90, 955), "KEY TAKEAWAY: AI predicts patterns; it does not “know” everything.", font=font(24), fill=WHITE)
    image.save(output)


def main() -> None:
    parser = argparse.ArgumentParser(description="Create Reel and carousel visual samples.")
    parser.add_argument("--presenter-image", required=True, type=Path)
    parser.add_argument("--output", default="../Insta reels/design samples", type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    reel_sample(args.presenter_image, args.output / "presenter-reel-concept.png")
    carousel_sample(args.output / "infographic-carousel-concept.png")
    print(f"Created design samples in {args.output}")


if __name__ == "__main__":
    main()
