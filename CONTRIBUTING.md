# Contributing

Thanks for helping improve this list.

## What belongs here

Good additions usually fall into one of these buckets:

- a local workflow with repeatable steps and concrete setup details
- a reusable template or playbook for AI-assisted development
- a high-signal external collection that expands discovery without adding noise
- updates to stale links, descriptions, or source snapshots

Preference order:

- local workflow or synthesized guide first
- external link second

## What does not belong here

Please avoid:

- generic tool roundups with no workflow angle
- marketing copy with no clear use case
- untested prompts with no setup context
- duplicate links that do not add a different perspective

## Adding a local workflow

1. Pick the closest template:
   - [`templates/workflow-template.md`](templates/workflow-template.md)
   - [`templates/nocode-workflow-template.md`](templates/nocode-workflow-template.md)
2. Create the workflow in the right `workflows/` subdirectory.
3. Give it a specific title and a short, practical summary.
4. Include setup steps, prompts, tools, limitations, and expected outcome.
5. Add a short validation note:
   - `Last verified: YYYY-MM-DD`
   - what was device-tested or source-validated
6. Add the link to `README.md` in the most relevant section.

## Adding an external source

When the source is too large to mirror locally, add it as a curated pointer instead of copying everything into the main README.

Good examples:

- a major workflow gallery
- a large node ecosystem
- a template repository with reusable development patterns
- a GitHub topic page worth monitoring

If you add an external source:

- explain why it is useful
- group it by use case
- keep descriptions brief and original
- add or update the source date in `resources/external-curated-sources.md`
- prefer placing detailed source notes in `resources/external-curated-sources.md` rather than the homepage

## Linting

This repository uses `awesome-lint` and a workflow quality check in CI.

Run locally:

```bash
npm run lint
```

```bash
npm run lint:workflows
```

If you do not want to use the npm script:

```bash
npx awesome-lint README.md
```

## Style

- Prefer concise descriptions over long summaries.
- Keep the README organized by use case, not by random tool names.
- Use direct links to the most useful page.
- Prefer practical wording over hype.
- When summarizing external repositories, paraphrase instead of copying README text verbatim.
- Prefer official docs for setup steps whenever they exist.
- Write steps so a reader can follow them without guessing missing taps or settings.
