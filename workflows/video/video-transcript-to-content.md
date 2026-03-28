---
name: Video Transcript → Blog Post + Shorts + Chapters
category: video
difficulty: beginner
tools: Whisper, Claude, CapCut / Descript
tested: true
---

# Video Transcript → Blog Post + Shorts + Chapters

> Recorded a tutorial or talk? Turn it into a blog post, chapter markers, and short-form clips with one prompt.

## What this is for

Video is rich content but poor in discoverability. Text is the opposite. This workflow extracts the transcript from any video, then uses Claude to generate all the derivative content — blog post, YouTube chapters, short-form clip scripts — in a single pass.

Works for: tutorials, conference talks, podcast episodes, webinar recordings, YouTube videos.

---

## Stack

| Tool | Role | Cost |
|------|------|------|
| [Whisper](https://github.com/openai/whisper) | Local transcription — free, no data leaves your machine | Free (open-source) |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | Download YouTube audio for transcription | Free (open-source) |
| [Claude.ai](https://claude.ai) | Blog post, chapters, clips, SEO metadata | Free / Pro $20/mo |
| [Descript](https://www.descript.com) | Transcript-based video editing, word-level cuts | Free / Creator $24/mo |
| [CapCut](https://www.capcut.com) | Short-form clips, captions, export | Free tier available |

---

## Step 1: Get the Transcript

### Option A — Your own recording (local file)

```bash
# Install Whisper
pip install openai-whisper

# Transcribe (choose model based on your hardware)
whisper my_video.mp4 --model medium --output_format txt
# Output: my_video.txt

# For better accuracy on technical content:
whisper my_video.mp4 --model large-v3 --output_format txt

# With timestamps (needed for chapter markers):
whisper my_video.mp4 --model medium --output_format srt
```

**Model selection guide:**
| Model | Size | Speed | Quality | Use When |
|-------|------|-------|---------|----------|
| `tiny` | 39MB | Very fast | Low | Quick draft, you'll edit heavily |
| `medium` | 769MB | Moderate | Good | Most use cases |
| `large-v3` | 1.5GB | Slow | Best | Final content, technical vocab |

### Option B — YouTube video

```bash
# Install yt-dlp
pip install yt-dlp

# Download audio only
yt-dlp -x --audio-format mp3 "https://www.youtube.com/watch?v=VIDEO_ID" -o "video.mp3"

# Transcribe
whisper video.mp3 --model medium --output_format txt

# Or: just use YouTube's auto-generated captions
# YouTube Studio → Subtitles → Download → .srt
```

### Option C — Fireflies / Otter (for recorded meetings/webinars)

Both tools export transcripts directly. Download as `.txt` from their dashboard.

---

## Step 2: Generate All Content in One Pass

Paste your transcript into Claude with this prompt:

```
You are a content producer. I'm giving you a video transcript. Generate all of the following from it.

---

**A. YouTube Chapter Markers**
Format: MM:SS Title (keep each title under 40 characters)
Start at 00:00. Create a chapter every time the topic meaningfully shifts.
There should be 6-12 chapters for a 30-60 minute video.

**B. Blog Post**
Length: [target word count, e.g., 1500 words]
Rules:
- Preserve the speaker's voice and specific examples — don't genericize
- Add a proper introduction (the video likely starts mid-thought)
- Add a conclusion with a clear takeaway
- Use H2 for main sections, H3 for subsections
- Format code examples in code blocks
- Remove filler words ("um", "you know", "like") but preserve informal tone where it's intentional

**C. 3 Short-Form Clips (60-90 seconds each)**
For each clip:
1. Timestamp range from the transcript (e.g., 14:22 - 15:45)
2. The verbatim quote for the clip
3. Why this works as a standalone clip
4. Suggested caption/hook text for the clip post

**D. 5 Standalone Pull Quotes**
Shareable sentences that work without context. For use as image-text posts.

**E. Meta Description** (for the blog post)
Max 155 characters. Include the primary keyword: [YOUR PRIMARY KEYWORD]

---

Transcript:
[PASTE TRANSCRIPT HERE]
```

---

## Sample Output

**Source:** 45-minute tutorial on "Building RAG pipelines with LlamaIndex"

**Chapter markers (excerpt):**
```
00:00 Introduction
02:15 What is RAG and why it matters
07:40 Setting up LlamaIndex
14:22 Chunking strategies: fixed vs semantic
23:10 Connecting to Qdrant vector DB
31:05 Hybrid search setup
38:45 Serving as a FastAPI endpoint
43:20 Common mistakes and how to fix them
```

**Short clip pick:**
```
Timestamp: 14:22 - 15:45
Quote: "Fixed-size chunking is like cutting a book into equal-length pieces
        regardless of where the chapters are. You end up with chunks that
        start mid-sentence and end mid-idea. Semantic chunking finds the
        natural breaks — it splits where the meaning actually changes."
Why it works: Complete standalone insight, no context needed, solves a
              specific misconception, quotable length.
Hook text: "Your RAG pipeline is probably chunking wrong. Here's why. 🧵"
```

---

## Step 3: Short-Form Video Editing

Once you have the clip timestamps from Step 2:

### With Descript (recommended for precision)
1. Import the video into [Descript](https://www.descript.com)
2. Descript auto-transcribes and shows you the transcript alongside the timeline
3. Find your clip timestamps, highlight the words, hit "Remove from Project" for everything outside
4. Export as MP4

### With CapCut (better for Reels/TikTok styling)
1. Import clip into [CapCut](https://www.capcut.com)
2. Add auto-captions (CapCut handles this well)
3. Apply B-roll, text overlays, or transitions
4. Export at 9:16 for Reels/TikTok, 16:9 for YouTube

---

## Automating the Pipeline

With n8n, you can fully automate: new YouTube upload → download audio → Whisper transcription → Claude content generation → save to Notion + schedule in Buffer.

See [n8n YouTube automation templates](https://n8n.io/workflows/?categories=marketing) for pre-built starting points.

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **Auto-transcription errors on technical terms:** Whisper doesn't always handle domain-specific vocab (library names, acronyms). Do a search-replace pass before sending to Claude.
- **Crosstalk in interviews/podcasts:** Whisper attribute speech to one speaker at a time. Diarization (speaker separation) requires additional tools like [pyannote.audio](https://github.com/pyannote/pyannote-audio).
- **Blog posts from transcripts need editing:** Spoken language has filler and repetition that survives even a good cleanup prompt. Plan for a 20-minute edit pass.
- **Short clips need visual context:** The Claude-generated clip script is excellent but the visual edit is still manual — the transcript alone doesn't tell you if the speaker is drawing a diagram at that moment.

---

## Sources

- [OpenAI Whisper GitHub](https://github.com/openai/whisper) — model docs and API reference
- [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp) — YouTube/audio downloader
- [Descript documentation](https://help.descript.com) — transcript-based editing
- [YouTube chapter markers guide (Google)](https://support.google.com/youtube/answer/9884579) — official format requirements
- [pyannote.audio](https://github.com/pyannote/pyannote-audio) — speaker diarization for multi-person recordings
