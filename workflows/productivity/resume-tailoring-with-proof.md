---
name: Resume Tailoring with Proof
category: productivity
difficulty: intermediate
tools: LinkedIn, resume file, Claude
tested: false
---

# Resume Tailoring with Proof

> Tailor a resume to a job description without turning it into fiction.

## What this is for

This workflow is for job applications where you want stronger matching without inventing experience.

## Workflow

### 1. Collect the three inputs

You need:

- current resume
- target job description
- proof points from real work

Proof points can be:

- shipped projects
- metrics
- tools used
- scope of responsibility

### 2. Ask for tailoring based on evidence only

```text
Tailor this resume for the target role.

Rules:
- only use experience that is already true
- prefer stronger wording, ordering, and relevance over invention
- call out any missing proof instead of making it up

Return:
1. revised summary
2. revised bullet points
3. missing evidence I should add manually
```

### 3. Save the tailored version per role

Do not overwrite the master resume.

Use one file per job family or per application.

### 4. Reuse saved application settings where it helps

If you apply via LinkedIn, keep your saved application info current so the final submission is fast.

## Validation

- Last verified: 2026-03-28
- Tested: false
- Source-validated against current LinkedIn job application settings and Easy Apply documentation

## Failure modes

- rewriting bullets without evidence
- one master resume for every role
- optimizing for keywords only and losing clarity

## Sources

- [LinkedIn: Save your job application information](https://www.linkedin.com/help/linkedin/answer/a507694/save-your-job-application-information?lang=en)
- [LinkedIn: Apply to jobs directly on LinkedIn](https://www.linkedin.com/help/linkedin/answer/a512348)
