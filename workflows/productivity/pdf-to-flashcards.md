---
name: PDF to Flashcards
category: productivity
difficulty: beginner
tools: Files app or PDF reader, Claude, Anki
tested: false
---

# PDF to Flashcards

> Turn a chapter, handout, or marked-up PDF into flashcards without manually rewriting every concept.

## What this is for

This workflow is useful when the material is already in document form:

- textbook chapters
- lecture handouts
- exam notes
- policy or medical review material

## Stack

| Tool | Role |
|------|------|
| Files app (iPhone), any PDF reader (desktop) | highlight and extract the right text |
| Claude or another LLM | convert content into question/answer pairs |
| Anki | spaced repetition destination |

## Workflow

### 1. Mark the source before summarizing it

Open the PDF and highlight:

- definitions
- steps
- formulas
- dates
- comparisons

If you skip this step, the model will often generate cards from the wrong parts of the document.

### 2. Copy only the relevant sections

Do not feed the whole book chapter unless you need to.

Start with one unit or one lecture at a time.

### 3. Generate flashcards in a simple import format

```text
Convert this material into flashcards.

Rules:
- one concept per card
- prefer question/answer format
- avoid vague prompts like "Explain this topic"
- keep each answer short enough to review quickly
- if a fact seems uncertain, mark it "verify"

Return as:
Front<TAB>Back
```

### 4. Import into Anki

Save the output as a plain text file, then import it into Anki.

If you want a safer first pass, import only 10 to 20 cards and review them before generating the rest.

## Validation

- Last verified: 2026-03-28
- Tested: false
- Source-validated against current Apple Markup tools and Anki import documentation

## Failure modes

- cards are too long
- cards test recognition instead of recall
- the AI merges multiple facts into one bad prompt

## Sources

- [Use Markup on your iPhone](https://support.apple.com/guide/iphone/mark-up-files-and-photos-iph3d3ec7f67/ios) — annotate PDFs and images
- [Anki Manual: importing](https://docs.ankiweb.net/importing/intro.html)
