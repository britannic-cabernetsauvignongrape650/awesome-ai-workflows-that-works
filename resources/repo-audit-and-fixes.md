# Repo Audit And Fixes

Audit date: March 28, 2026

## Problems found

### 1. Category system was too implementation-led

The repo mixed folder names, frontmatter names, and homepage labels. The biggest visible mismatch was `MeetingNotes` appearing as a mixed-case category while the README grouped those workflows under productivity.

Fix:

- documented the category system in `resources/category-system.md`
- normalized reader-facing sections in `README.md`
- moved meeting workflows into their own reader-facing section

### 2. Mobile workflows were useful but too vague

Several phone automations told the reader the idea, but not the exact taps, trigger choices, or minimum setup needed to reproduce it.

Fix:

- rewrote the main mobile workflows with explicit iPhone and Android steps
- added validation notes and official sources

### 3. Validation was not obvious enough

Many workflows had `tested: false`, but did not say what had actually been checked.

Fix:

- updated key daily-use workflows to include a `Validation` section
- tightened the templates so future additions should declare what was verified

### 4. A few visible files still had stale or weak source formatting

Some source sections used plain names, and a few older files had formatting artifacts or low-trust examples.

Fix:

- replaced bare source names with links in key guide files
- replaced the broad media encyclopedia page with a smaller map page

### 5. Everyday-use communities were underrepresented in the README

Students, job seekers, travelers, and families had weak or no reader-facing discovery, even when the repo already had the beginnings of those workflows.

Fix:

- added dedicated student, career, travel, and family workflows
- split the README into clearer reader-facing sections for those audiences
- updated the top-of-page discovery surfaces so the repo no longer reads like a dev-only collection

### 6. Workflow structure drift had become visible

The repo had several equivalent heading styles for the same idea, which made the catalog feel more patchwork than it needed to.

Fix:

- normalized common section headings across the workflow library
- added a `Validation` section to older workflows where it was missing
- tightened the rule that sources should be links instead of bare names

## Still worth improving next

- several older long-form files could still use stronger examples and screenshots
- a CI check for missing `Validation` sections and bare source names would still be worth adding
- the social preview and other meta assets should always be kept in sync with the workflow count
