---
name: Mobile Quick Capture and Follow-Up
category: productivity
difficulty: beginner
tools: iPhone Shortcuts, Siri, Google Keep, email, reminders
tested: false
---

# Mobile Quick Capture and Follow-Up

> Capture a thought or commitment in under 10 seconds, then route it into the one place you already trust.

## What this is for

This workflow is for small commitments that disappear if they spend an hour in your head:

- "send this later"
- "follow up with them tomorrow"
- "turn this into a task"

## Workflow

### iPhone

Build one shortcut called `Quick Capture`.

1. Open `Shortcuts`.
2. Tap `+` to create a shortcut.
3. Add `Choose from Menu` with:
   - `Note`
   - `Reminder`
   - `Email myself`
4. For `Note`, add:
   - `Ask for Input`
   - `Append to Note`
5. For `Reminder`, add:
   - `Ask for Input`
   - `Add New Reminder`
6. For `Email myself`, add:
   - `Ask for Input`
   - `Send Email`
7. Enable Siri phrase support so you can say `Quick Capture`.

### Android

Use Google Keep as the default inbox.

1. Open `Google Keep`.
2. Pin it to the home screen or widget tray.
3. Use:
   - text note for quick capture
   - checklist for tasks
   - reminder for time or location follow-up
4. If you need routing, add a macro in your preferred Android automation app that opens Keep or starts voice input.

## Recommended rule

Pick one inbox destination first:

- notes inbox
- reminders
- self-email

Do not split capture across all three unless the shortcut asks you explicitly.

## Validation

- Last verified: 2026-03-28
- Tested: false
- Source-validated against current Apple Shortcuts and Google Keep documentation

## Failure modes

- too many menu branches slow capture down
- multiple inboxes create cleanup debt
- voice input without a review step creates garbage tasks

## Sources

- [Apple Shortcuts User Guide](https://support.apple.com/en-us/HT208309)
- [Apple Shortcuts: Intro to editing shortcuts](https://support.apple.com/guide/shortcuts/apd5b1537ca0/ios)
- [Google Keep: Set up reminders for your notes](https://support.google.com/keep/answer/3187168/set-up-reminders-for-your-notes-computer?co=GENIE.Platform%3DiOS&hl=en)
