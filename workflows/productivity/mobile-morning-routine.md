---
name: Mobile Morning Routine Automation
category: productivity
difficulty: beginner
tools: iPhone Shortcuts, Google Home Routines, Calendar, Weather
tested: false
---

# Mobile Morning Routine Automation

> Build one morning routine that shows the day, the weather, and the first important task before you drift into notifications.

## What this is for

This is the most reusable phone automation in the repo because it makes the first 60 seconds of the day less random.

Use it when you want:

- a consistent start to the workday
- calendar plus weather in one place
- one action prompt instead of ten open apps

## Workflow

### iPhone

1. Open `Shortcuts`.
2. Go to `Automation`.
3. Tap `+` then `Create Personal Automation`.
4. Choose one trigger:
   - `Time of Day`
   - `Alarm`
   - `Focus`
5. Add actions in this order:
   - `Get Upcoming Events`
   - `Get Current Weather`
   - `Find Reminders`
   - `Text` or `Show Result` to combine the output
   - optional: `Speak Text`
   - optional: `Open App` for your task manager
6. Turn off `Ask Before Running` if the trigger supports it and you want a hands-free start.

Good default output:

```text
Today:
- next two meetings
- current weather
- top three reminders
- one thing I must not forget
```

### Android

1. Open `Google Home`.
2. Go to `Automations`.
3. Create a `Personal` routine.
4. Choose a starter:
   - voice command such as "good morning"
   - time of day
5. Add actions:
   - weather
   - calendar events
   - commute or traffic if useful
   - music or news only if that helps, not by default

If you need stronger device control than Google Home offers, keep the routine for briefing only and handle app-specific actions with a dedicated Android automation tool.

## Validation

- Last verified: 2026-03-28
- Tested: false
- Source-validated against current Apple Shortcuts and Google Home Routines documentation

## Failure modes

- adding too many outputs makes the routine noisy
- opening distracting apps defeats the point
- voice output is annoying if the routine fires in the wrong place

## Sources

- [Apple Shortcuts: Intro to personal automation](https://support.apple.com/guide/shortcuts/apd690170742/ios)
- [Apple Shortcuts: Intro to editing shortcuts](https://support.apple.com/guide/shortcuts/apd5b1537ca0/ios)
- [Google Home: Create and manage Routines](https://support.google.com/googlenest/answer/7029585?co=GENIE.Platform%3DAndroid&hl=en-ca)
- [Google Nest: Get calendar and event information](https://support.google.com/googlenest/answer/7029002?hl=en-SG)
