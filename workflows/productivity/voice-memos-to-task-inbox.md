---
name: Voice Memos to Task Inbox
category: productivity
difficulty: beginner
tools: Voice Memos or Recorder, Whisper, Claude
tested: false
---

# Voice Memos to Task Inbox

> Record a short memo, transcribe it, and turn it into tasks instead of leaving it as audio you never replay.

## What this is for

Use this when ideas appear away from the keyboard:

- after meetings
- while walking
- while commuting
- while switching between tasks

## Workflow

### 1. Record short memos only

Keep the memo:

- on one topic
- under 3 minutes
- phrased as bullets if possible

The best self-prompt is:

```text
What happened, what matters, what needs doing, by when?
```

### 2. Export or share the recording

On iPhone, record in `Voice Memos` and share or export the file.

On Android, use your preferred recorder or the native recorder app and export the audio file.

### 3. Transcribe it

```bash
whisper my-note.m4a --model small --output_format txt
```

Use `small` for speed. Move to `medium` if the note has names, deadlines, or multilingual content.

### 4. Turn the transcript into structured output

```text
Turn this transcript into:
1. tasks
2. follow-up messages I should send
3. reminders or calendar blocks if needed
4. notes that should stay as reference, not tasks

Keep missing details marked as TBD instead of inventing them.
```

### 5. Route the output immediately

- tasks to your task manager
- replies to email or chat drafts
- reminders to calendar
- reference notes to your notes app

## Validation

- Last verified: 2026-03-28
- Tested: false
- Source-validated against current Whisper docs; workflow logic verified against current iPhone Voice Memos behavior

## Failure modes

- long rambling memos produce bad extraction
- noisy recordings reduce transcript quality
- no default inbox means the cleaned output still gets lost

## Sources

- [OpenAI Whisper](https://github.com/openai/whisper)
- [Whisper model reference](https://github.com/openai/whisper#available-models-and-languages)
- [Apple Voice Memos on iPhone](https://support.apple.com/guide/iphone/iphbda915db2/ios)
