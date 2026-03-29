---
name: Candidate Screening and Interview Scorecards
category: productivity
difficulty: intermediate
tools: Resume parser, Claude, Greenhouse, Notion, Google Docs
tested: false
---

# Candidate Screening and Interview Scorecards

> Turn resumes and interview notes into structured scorecards so hiring decisions are faster, fairer, and less memory-driven.

## What this is for

This workflow helps hiring teams process candidates consistently by standardizing:

- resume review
- interview note cleanup
- scorecard generation
- final recommendation summaries

## Workflow

### 1. Parse the candidate packet

Inputs:

- resume
- portfolio or GitHub
- job description
- recruiter notes

### 2. Build a role-specific rubric

Example dimensions:

- role fit
- technical depth
- communication
- seniority signal
- risk or missing evidence

### 3. Generate the screening summary

Prompt:

```text
Compare this candidate to the role.
Return:
- strengths
- concerns
- open questions
- recommended interview focus
- initial hire signal: yes, maybe, no
```

### 4. Convert interview notes into scorecards

Prompt:

```text
Turn these messy interview notes into a scorecard with:
- evidence-backed strengths
- concerns
- unanswered questions
- hire recommendation
Do not invent evidence that is not in the notes.
```

## Why It Works

Hiring quality improves when the workflow captures evidence and comparison criteria early instead of relying on vague recollection at debrief time.

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: false
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- AI should not make final hiring decisions
- interview bias can be preserved if the rubric is weak
- notes quality still matters

## Sources

- [Greenhouse scorecards support](https://support.greenhouse.io/hc/en-us/articles/200721564-Edit-an-interviewer-s-scorecard-submission)



