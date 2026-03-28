---
name: Lecture to Study Guide
category: productivity
difficulty: beginner
tools: Google Docs voice typing, Voice Memos or Recorder, Claude, notes app
tested: false
---

# Lecture to Study Guide

> Turn a lecture, lesson, or class recording into a study guide you can actually revise from.

## What this is for

Use this when you have:

- a lecture recording
- rough notes from class
- a transcript that needs cleanup

The goal is not just summarization. The goal is a usable revision sheet with terms, questions, and weak points.

## Stack

| Tool | Role |
|------|------|
| Voice recorder or lecture recording | source material |
| Google Docs voice typing or transcript tool | quick transcript cleanup |
| Claude or another LLM | structure, simplify, and extract questions |
| notes app or docs app | final study guide destination |

## Workflow

### 1. Start from one source of truth

Pick one:

- lecture recording
- transcript
- your own class notes

If you have all three, use the transcript as the base and your notes as correction material.

### 2. Create or clean the transcript

If you do not already have a transcript, use your preferred recorder or speech-to-text tool.

If you are cleaning a transcript manually, Google Docs voice typing is a fast fallback for dictated notes and recap sections.

### 3. Send it to the model with a strict format

```text
Turn this lecture into a study guide with:
1. the core topic in 3 sentences
2. key concepts with short definitions
3. a timeline or process if one exists
4. likely exam questions
5. things that are easy to confuse
6. a 10-minute revision version

Do not invent concepts that were not covered.
Flag anything unclear as "verify in source notes".
```

### 4. Add your corrections immediately

Fix:

- names
- formulas
- dates
- professor-specific terminology

Do this before you start memorizing the summary.

## Validation

- Last verified: 2026-03-28
- Tested: false
- Source-validated against current Google Docs voice typing documentation

## Failure modes

- summarizing before correcting obvious transcript mistakes
- over-trusting AI on formulas or dates
- making the guide too short to be useful later

## Sources

- [Google Docs: Type and edit with your voice](https://support.google.com/docs/answer/4492226?hl=en)
- [Apple Voice Memos on iPhone](https://support.apple.com/guide/iphone/iphbda915db2/ios)
