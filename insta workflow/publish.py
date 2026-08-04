#!/usr/bin/env python3
"""Publish a reviewed Reel using Instagram's official Graph API."""

from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path

import requests


def api_url(path: str) -> str:
    version = os.environ.get("INSTAGRAM_GRAPH_API_VERSION", "v24.0")
    return f"https://graph.facebook.com/{version}/{path.lstrip('/')}"


def request(method: str, path: str, **kwargs: object) -> dict:
    response = requests.request(method, api_url(path), timeout=30, **kwargs)
    response.raise_for_status()
    return response.json()


def main() -> None:
    parser = argparse.ArgumentParser(description="Publish an existing Reel through Meta's Graph API.")
    parser.add_argument("--video-url", required=True, help="Public HTTPS MP4 URL Meta can download")
    parser.add_argument("--caption-file", type=Path, help="Caption text file from generate.py")
    parser.add_argument("--caption", help="Caption override")
    parser.add_argument("--wait-seconds", type=int, default=5, help="Polling interval for video processing")
    args = parser.parse_args()

    account_id = os.environ.get("INSTAGRAM_USER_ID")
    token = os.environ.get("INSTAGRAM_ACCESS_TOKEN")
    if not account_id or not token:
        raise SystemExit("Set INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN before publishing.")
    if not args.video_url.startswith("https://"):
        raise SystemExit("--video-url must be a publicly reachable HTTPS URL, not a local file path.")
    if args.caption and args.caption_file:
        raise SystemExit("Use only one of --caption and --caption-file.")
    caption = args.caption or (args.caption_file.read_text(encoding="utf-8").strip() if args.caption_file else "")
    params = {"access_token": token}

    container = request(
        "POST",
        f"{account_id}/media",
        data={**params, "media_type": "REELS", "video_url": args.video_url, "caption": caption, "share_to_feed": "true"},
    )
    container_id = container["id"]
    print(f"Created container {container_id}; waiting for Meta to finish processing.")

    for _ in range(60):
        status = request("GET", container_id, params={**params, "fields": "status_code,status"})
        print(f"Status: {status.get('status_code', status.get('status', 'unknown'))}")
        if status.get("status_code") == "FINISHED":
            published = request("POST", f"{account_id}/media_publish", data={**params, "creation_id": container_id})
            print(json.dumps(published, indent=2))
            return
        if status.get("status_code") in {"ERROR", "EXPIRED"}:
            raise SystemExit(f"Meta could not process this Reel: {json.dumps(status)}")
        time.sleep(args.wait_seconds)
    raise SystemExit("Timed out waiting for Meta processing; check the container status in Meta.")


if __name__ == "__main__":
    main()
