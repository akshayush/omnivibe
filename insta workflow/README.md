# Instagram education-Reel workflow

This standalone workflow creates short vertical lesson videos, gives each video a caption, and can publish a reviewed Reel through Meta's official Instagram Graph API.

## What it does

- Generates an editable five-card teaching script from a topic.
- Renders a narrated, classroom-style 1080×1920 MP4 using `ffmpeg`'s local text-to-speech support.
- Produces an Instagram caption alongside the project.
- Publishes a hosted MP4 as a Reel only after you explicitly run the publish command.

The generated video is a text-card lesson. It is intentionally designed to work without a paid AI or stock-media service. Edit `project.json` before rendering to make the lesson accurate and specific.

## Setup

```bash
cd "insta workflow"
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Ubuntu/Debian, if ffmpeg is not already installed:
sudo apt-get install ffmpeg
```

## Create and render a Reel

```bash
python generate.py --topic "Why the sky looks blue" --audience "high school students"
python render.py "../Insta reels/why-the-sky-looks-blue/project.json"
```

This creates:

```text
Insta reels/why-the-sky-looks-blue/
├── caption.txt
├── project.json       # edit scene titles, text, and duration here
└── reel.mp4
```

Review `reel.mp4` before sharing it. The renderer uses a friendly illustrated teacher and a local synthesized voice; it is not a realistic, lip-synced human actor. Add approved actor footage, music, or a professional voiceover in your preferred editor if needed.

## Publish to Instagram

Instagram publishing is supported only for a Professional account (Business or Creator) connected to a Facebook Page and a Meta app with the required permissions. A local MP4 cannot be sent directly to Meta: first upload the reviewed file to a public, HTTPS-accessible URL.

1. Copy `.env.example` to a secure location outside Git and fill in the account ID and token.
2. Export the values into your shell. Do not place tokens in `project.json`, captions, or Git.
3. Run:

```bash
python publish.py \
  --video-url "https://media.example.com/why-the-sky-looks-blue.mp4" \
  --caption-file "../Insta reels/why-the-sky-looks-blue/caption.txt"
```

`publish.py` creates a Reel container, waits for Meta to process it, then publishes it. It does not use browser automation, passwords, or private Instagram endpoints.

## Safety checklist

- Fact-check every lesson and use media you have rights to use.
- Review the rendered video, caption, hashtags, and destination account before publishing.
- Keep access tokens in your shell, secret manager, or CI secret store—not in this repository.
