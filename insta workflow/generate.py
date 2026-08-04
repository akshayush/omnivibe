#!/usr/bin/env python3
"""Create an education-Reel project package without requiring an AI API."""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "education-reel"


def build_project(topic: str, audience: str, duration: int) -> dict:
    scene_duration = max(3, duration // 5)
    normalized = topic.strip().rstrip(".?!")
    scenes = [
        {"title": f"Learn {normalized}", "body": f"A quick lesson for {audience}.", "duration": scene_duration},
        {"title": "Start with the idea", "body": f"{normalized} is easier when you focus on the main pattern first.", "duration": scene_duration},
        {"title": "Why it matters", "body": "Knowing the why helps you remember the how.", "duration": scene_duration},
        {"title": "Try this", "body": f"Explain {normalized} in one simple sentence to someone else.", "duration": scene_duration},
        {"title": "Save this lesson", "body": "Follow for another short, practical lesson.", "duration": scene_duration},
    ]
    narration = " ".join(f"{scene['title']}. {scene['body']}" for scene in scenes)
    caption = (
        f"{normalized} in under a minute. Save this for your next study session.\n\n"
        f"#education #learning #{slugify(normalized).replace('-', '')} #studytok #learnontiktok"
    )
    return {
        "topic": normalized,
        "audience": audience,
        "created_on": str(date.today()),
        "format": {"width": 1080, "height": 1920, "fps": 30},
        "scenes": scenes,
        "narration": narration,
        "caption": caption,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate an education Reel project.")
    parser.add_argument("--topic", required=True, help="Lesson subject, e.g. 'Newton's third law'")
    parser.add_argument("--audience", default="beginners", help="Audience label for the opening card")
    parser.add_argument("--duration", type=int, default=30, help="Approximate duration in seconds (minimum 15)")
    parser.add_argument("--output", default="output", help="Directory for generated project packages")
    args = parser.parse_args()

    if args.duration < 15:
        parser.error("--duration must be at least 15 seconds")

    project_dir = Path(args.output) / slugify(args.topic)
    project_dir.mkdir(parents=True, exist_ok=True)
    project = build_project(args.topic, args.audience, args.duration)

    (project_dir / "project.json").write_text(json.dumps(project, indent=2) + "\n", encoding="utf-8")
    (project_dir / "caption.txt").write_text(project["caption"] + "\n", encoding="utf-8")
    print(f"Created {project_dir / 'project.json'}")
    print("Edit project.json to customize the lesson before rendering.")


if __name__ == "__main__":
    main()
