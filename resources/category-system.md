# Category System

This repository now uses two layers of categorization.

## 1. Storage categories

These are the folders under `workflows/`. They keep the repo easy to navigate in GitHub and in editors:

- `dev`
- `devops`
- `marketing`
- `research`
- `productivity`
- `music`
- `video`
- `security`
- `MeetingNotes`

## 2. Reader-facing categories

These are the sections a human sees in `README.md`. They are based on intent, not implementation:

- Build and code
- Business, content, and support
- Meetings and communication
- Research and data
- Students and learning
- Career and job search
- Travel and personal life
- Family and household
- Health and accessibility
- Finance and records
- Personal productivity and admin
- Music and audio
- Video and media
- Security and operations

## Normalization rules

- Use lowercase category values in frontmatter where possible.
- Prefer `meetings` instead of `MeetingNotes` in frontmatter for new or revised files.
- Keep the folder path stable unless there is a strong reason to move files.
- If a workflow can fit in two places, choose the place a new reader would look first.

## Quality rules

- Every workflow should say who it is for.
- Steps should be runnable in order.
- If the workflow is not device-tested, say what was validated from official docs.
- Sources should be links, not bare names.
- Reader-facing categories should help a non-technical visitor find the right workflow in one scan.
