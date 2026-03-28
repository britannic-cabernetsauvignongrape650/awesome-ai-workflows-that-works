---
name: Mobile PDF to Summary
category: productivity
difficulty: beginner
tools: Safari, Files, Files by Google, Claude
tested: false
---

# Mobile PDF to Summary

> Save a PDF on your phone, send it to an AI summarizer, and come back with obligations, action items, and a short brief instead of twenty unstructured pages.

## What this is for

This workflow is useful for:

- contracts
- reports
- whitepapers
- slide decks
- receipts and policy documents

## Workflow

### iPhone

1. Open the PDF in `Safari` or any app that shows the file.
2. Tap `Share`.
3. Save it to `Files`.
4. Open the PDF from `Files`.
5. Share the file into your AI app, or copy the text if the app needs plain text.

If the source is a webpage, save or share it as PDF first, then send that version for summarization.

### Android

1. Open or scan the document with `Files by Google`.
2. Confirm the PDF saved correctly.
3. Share the file into your AI app.
4. Ask for:
   - summary
   - obligations or decisions
   - action items
   - anything to verify manually

## Prompt

```text
Summarize this PDF into:
- key points
- decisions or obligations
- action items
- anything I should verify manually

If the document is long, prioritize what matters to a person who needs to act on it today.
```

## Validation

- Last verified: 2026-03-28
- Tested: false
- Source-validated against current Apple iPhone PDF handling and Files by Google documentation

## Failure modes

- image-only PDFs may need OCR first
- very large PDFs can exceed app limits
- AI summaries should not replace legal or compliance review

## Sources

- [Apple iPhone: Download a PDF from Safari](https://support.apple.com/guide/iphone/ipha9ed5131c/ios)
- [Apple iPhone: Save a webpage as a PDF](https://support.apple.com/guide/iphone/iphfd5b616b5/ios)
- [Files by Google: Scan documents](https://support.google.com/files/answer/15598575?hl=en)
- [Files by Google: Open, manage, and edit PDFs](https://support.google.com/files/answer/15949407?hl=en)
