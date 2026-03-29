---
name: AI Meeting Notes - Transcript to Action Items
category: meetings
difficulty: beginner
tools: Fireflies, Otter, Whisper, Claude, Notion or Slack
tested: true
---

# AI Meeting Notes - Transcript to Action Items

> Capture one transcript, then turn it into a summary, action list, and follow-up message you can send the same day.

## What this is for

This workflow is for meetings that should end with clear ownership instead of vague memory:

- weekly syncs
- client calls
- sprint planning
- design reviews
- 1:1s

## Stack

| Tool | Role |
|------|------|
| Fireflies or Otter | hosted transcript capture |
| Whisper | local transcript option |
| Claude or another LLM | summary, actions, and follow-up drafting |
| Notion, Slack, or email | destination for the final output |

## Workflow

### 1. Pick one transcript path

Hosted path:

- let Fireflies or Otter capture the meeting
- export the transcript as `.txt` or copy the full transcript

Local path:

```bash
pip install openai-whisper
whisper meeting_2026-03-28.mp3 --model medium --output_format txt
```

Use `medium` first. Move to `large-v3` only when the call is noisy or speaker attribution matters more than speed.

### 2. Send the transcript to your summarizer

Use a prompt like this:

```text
Turn this transcript into:
1. a 5-bullet summary
2. decisions made
3. action items with owner and due date
4. open questions
5. a follow-up message I can paste into Slack

Do not invent names, dates, or commitments that are not present in the transcript.
```

### 3. Review before you send

Check three things:

- owners are assigned to the right person
- dates match what was said
- unresolved questions did not get turned into fake decisions

### 4. Publish one clean follow-up

Good destinations:

- Slack project channel
- Notion meeting database
- reply-all email
- Linear or Jira tickets for real action items

## Validation

- Last verified: 2026-03-28
- Tested: true
- Verified in practice with recorded meeting transcripts and against current Whisper documentation

## Failure modes

- transcript errors cause wrong owners
- crosstalk lowers summary quality
- cloud transcription may not fit confidential meetings

## Sources

- [OpenAI Whisper GitHub](https://github.com/openai/whisper)
- [Whisper model reference](https://github.com/openai/whisper#available-models-and-languages)
- [Notion meeting notes template](https://www.notion.so/templates/meeting-notes)
