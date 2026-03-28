---
name: Pomodoro and Focus Mode Automation
category: productivity
difficulty: beginner
tools: iPhone Focus, Shortcuts, Android Focus mode, timer
tested: false
---

# Pomodoro and Focus Mode Automation

> Start one focus session that changes your device state on purpose, not just the timer.

## What this is for

This workflow ties a work session to the phone setup around it:

- focus mode
- timer
- reduced interruptions
- end-of-session review

## Workflow

### iPhone

1. Configure a Focus mode in `Settings > Focus`.
2. Open `Shortcuts > Automation`.
3. Create a personal automation with trigger `Focus`.
4. Choose `When Turning On`.
5. Add actions:
   - `Start Timer` for 25 or 50 minutes
   - `Open App` for your task manager
   - optional: `Set Volume`
   - optional: `Open Note` for session planning
6. Create a second automation for `When Turning Off`.
7. Add actions:
   - `Open App` for notes or reminders
   - `Show Result` with a review prompt

### Android

1. Open `Settings > Digital Wellbeing & parental controls`.
2. Open `Focus mode`.
3. Pick the distracting apps to pause.
4. Turn Focus mode on manually or set a schedule.
5. Pair it with:
   - a timer app
   - Do Not Disturb if needed
   - a quick note or checklist at the end of the session

## Review prompt

```text
What did I finish, what is blocked, and what is the exact next step for the next session?
```

## Validation

- Last verified: 2026-03-28
- Tested: false
- Source-validated against current Apple Shortcuts setting triggers and Android Digital Wellbeing documentation

## Failure modes

- opening too many apps when focus starts
- no shutdown routine after the timer ends
- pausing notifications without deciding what gets through in emergencies

## Sources

- [Apple Shortcuts: Setting triggers](https://support.apple.com/guide/shortcuts/apde31e9638b/ios)
- [Android Help: Manage how you spend time on your phone with Digital Wellbeing](https://support.google.com/android/answer/9346420?hl=en)
