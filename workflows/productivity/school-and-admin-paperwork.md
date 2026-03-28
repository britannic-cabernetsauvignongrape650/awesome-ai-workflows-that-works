---
name: School and Admin Paperwork
category: productivity
difficulty: beginner
tools: Files app / Markup, shared list, family calendar, Claude
tested: false
---

# School and Admin Paperwork

> Handle school forms, signatures, deadlines, and follow-ups without losing documents in photos or chat.

## What this is for

Use this for:

- school paperwork
- enrollment or permission forms
- household admin PDFs
- recurring deadline-based family admin

## Workflow

### 1. Scan or save every document into one inbox

Use a single folder or note for:

- PDFs
- scans
- deadlines
- who needs to sign

### 2. Fill or annotate immediately when possible

If the form is digital, fill or sign it using Markup (iPhone) or your PDF reader (desktop) instead of postponing it.

### 3. Extract the deadlines

Ask the model:

```text
Read this form and extract:
- deadlines
- required signatures
- documents still needed
- anything that should go on a calendar or reminder list
```

### 4. Route the outputs

- calendar for dates
- reminders for tasks
- shared list for family follow-up
- archive folder for the final version

## Validation

- Last verified: 2026-03-28
- Tested: false
- Source-validated against current Apple Markup PDF handling and shared reminder workflows

## Failure modes

- no single document inbox
- extracting deadlines manually but never scheduling them
- keeping only the unsigned version

## Sources

- [Use Markup on your iPhone](https://support.apple.com/guide/iphone/mark-up-files-and-photos-iph3d3ec7f67/ios) — annotate and sign PDFs
- [Apple: Share and assign reminders on iPhone](https://support.apple.com/en-us/105124)
