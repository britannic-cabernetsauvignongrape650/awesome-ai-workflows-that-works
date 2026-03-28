---
name: AI Contract Analysis & Clause Extraction
category: productivity
difficulty: beginner
tools: Claude, Python, PyMuPDF
tested: true
---

# AI Contract Analysis & Clause Extraction

> Upload any PDF contract. Claude extracts risky clauses, flags red flags, and suggests plain-English rewrites — in under 60 seconds.

## The Problem

Reviewing a contract properly takes a lawyer 2–4 hours and costs $500–$2,000. Most founders and operators sign contracts they don't fully understand. This workflow doesn't replace a lawyer for high-stakes deals — but it:

- Surfaces the 20% of clauses that cause 80% of disputes
- Translates legalese into plain English before you bring in a lawyer
- Flags clauses that are non-standard or unusually risky
- Prepares you to negotiate intelligently

---

## Stack

| Tool | Role | Cost |
|------|------|------|
| [Claude](https://claude.ai) | Contract analysis, rewriting, explanation | $0.01–0.05/contract |
| [PyMuPDF](https://pymupdf.readthedocs.io) | Extract text from PDF | Free |
| [Claude Files API](https://docs.anthropic.com/en/docs/build-with-claude/files) | Upload and process PDFs directly | Included |

---

## Method 1: Direct PDF Upload (Easiest)

Claude can read PDFs directly. No extraction needed.

```python
import anthropic

client = anthropic.Anthropic()

# Upload the contract PDF
with open("contract.pdf", "rb") as f:
    file_response = client.beta.files.upload(
        file=("contract.pdf", f, "application/pdf"),
    )
file_id = file_response.id

# Analyze it
response = client.beta.messages.create(
    model="claude-opus-4-6",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "document",
                "source": {"type": "file", "file_id": file_id},
            },
            {
                "type": "text",
                "text": CONTRACT_ANALYSIS_PROMPT
            }
        ]
    }],
    betas=["files-api-2025-04-14"],
)

print(response.content[0].text)
```

---

## The Analysis Prompt

```python
CONTRACT_ANALYSIS_PROMPT = """Analyze this contract and produce a structured report.

## 1. Contract Overview
- Type of contract (NDA, employment, SaaS, service agreement, etc.)
- Parties involved
- Effective date and term
- Governing law and jurisdiction

## 2. Red Flags 🚨
List every clause that is:
- Unusually one-sided
- Potentially unenforceable
- Non-standard for this contract type
- Could cause serious harm if triggered

For each: quote the exact clause → explain the risk in plain English → rate risk (High/Medium/Low)

## 3. Key Obligations
What am I required to do? What am I prohibited from doing?
Include: deadlines, payment terms, exclusivity, non-compete, IP assignment, confidentiality scope.

## 4. Termination & Exit Conditions
- Under what conditions can each party terminate?
- What happens to IP, data, payments on termination?
- Are there auto-renewal clauses? Notice period?

## 5. Liability & Indemnification
- What am I liable for?
- Is liability capped? At what amount?
- Am I indemnifying them for their own negligence?

## 6. Plain-English Summary
A 5-sentence summary a non-lawyer can understand. Focus on the most important things.

## 7. Suggested Rewrites
For the top 3 most problematic clauses:
- ORIGINAL: [quote exact text]
- PROBLEM: [what's wrong with it]
- SUGGESTED REWRITE: [alternative language that's more balanced]

## 8. Questions to Ask Before Signing
5 specific questions to ask the other party or your lawyer.
"""
```

---

## Method 2: Python Script for Bulk Processing

For processing many contracts or when you need to extract before analyzing:

```python
import anthropic
import pymupdf  # pip install pymupdf
import sys
from pathlib import Path


def extract_text(pdf_path: str) -> str:
    doc = pymupdf.open(pdf_path)
    return "\n\n".join(page.get_text() for page in doc)


def analyze_contract(pdf_path: str, focus: str = "general") -> str:
    """
    focus options: "general" | "ip" | "employment" | "nda" | "saas"
    """
    client = anthropic.Anthropic()

    text = extract_text(pdf_path)

    # Contracts can be long — use extended thinking for complex ones
    if len(text) > 20000:
        model = "claude-opus-4-6"
        extra = "\n\nThis is a long contract. Be thorough."
    else:
        model = "claude-sonnet-4-6"
        extra = ""

    focus_addendum = {
        "ip": "\n\nPay special attention to IP ownership, assignment, and work-for-hire clauses.",
        "employment": "\n\nPay special attention to non-compete, non-solicitation, and at-will clauses.",
        "nda": "\n\nPay special attention to the definition of Confidential Information and its exceptions.",
        "saas": "\n\nPay special attention to SLAs, data ownership, and termination data export rights.",
        "general": ""
    }.get(focus, "")

    response = client.messages.create(
        model=model,
        max_tokens=4096,
        messages=[{
            "role": "user",
            "content": CONTRACT_ANALYSIS_PROMPT + extra + focus_addendum + f"\n\nCONTRACT TEXT:\n{text}"
        }]
    )

    return response.content[0].text


# CLI usage
if __name__ == "__main__":
    pdf_path = sys.argv[1]
    focus = sys.argv[2] if len(sys.argv) > 2 else "general"

    print(f"Analyzing {pdf_path} (focus: {focus})...\n")
    analysis = analyze_contract(pdf_path, focus)

    # Save to markdown file
    output_path = Path(pdf_path).stem + "_analysis.md"
    Path(output_path).write_text(analysis)
    print(f"\nAnalysis saved to: {output_path}")
    print(analysis)
```

**Usage:**
```bash
pip install anthropic pymupdf

python analyze_contract.py vendor_agreement.pdf saas
python analyze_contract.py employment_offer.pdf employment
python analyze_contract.py mutual_nda.pdf nda
```

---

## Sample Output

```
## 1. Contract Overview
- Type: SaaS Master Subscription Agreement
- Parties: Acme Corp (Vendor) and [Your Company] (Customer)
- Term: 12 months, auto-renews annually
- Governing law: Delaware, USA

---

## 2. Red Flags 🚨

**🔴 HIGH RISK — Section 8.3: Unilateral Price Changes**
> "Vendor may modify pricing with 30 days written notice."
RISK: Vendor can raise prices 30 days before renewal with no cap. You could face
a 100% price increase with no recourse except to exit.

**🔴 HIGH RISK — Section 12.1: IP Ownership of Customizations**
> "Any modifications, customizations, or configurations made by Customer
shall become the exclusive property of Vendor."
RISK: If your team configures or customizes the software, those configurations
belong to the vendor. You could lose months of setup work if you leave.

**🟡 MEDIUM RISK — Section 15.2: Broad Indemnification**
> "Customer shall indemnify Vendor against any and all third-party claims
arising from Customer's use of the Service."
RISK: You're covering even claims caused by the Vendor's own negligence.
Standard: mutual indemnification limited to each party's own wrongdoing.

---

## 6. Plain-English Summary
This is a standard SaaS agreement with two significant problems: the vendor can
raise prices with only 30 days notice, and anything you customize belongs to them.
The auto-renewal clause gives you only a 60-day window to cancel each year.
Liability is capped at 3 months of fees, which is low. Overall, this contract
strongly favors the vendor — push back on sections 8.3, 12.1, and 15.2.

---

## 7. Suggested Rewrites

**Section 8.3 — Pricing**
ORIGINAL: "Vendor may modify pricing with 30 days written notice."
PROBLEM: No cap, no minimum notice, applies mid-term.
SUGGESTED: "Vendor may not increase fees during the current Subscription Term.
For renewal terms, Vendor may increase fees by no more than 5% with 90 days
written notice prior to renewal."

**Section 12.1 — IP**
ORIGINAL: "Any modifications...shall become the exclusive property of Vendor."
PROBLEM: You lose your own configuration work.
SUGGESTED: "Customer retains all rights to Customer Data and Customer-specific
configurations. Vendor retains rights to the underlying platform and codebase."

---

## 8. Questions to Ask Before Signing
1. Can you cap annual price increases at CPI or 5%?
2. Will you add a data portability clause guaranteeing export of our data in
   standard format within 30 days of termination?
3. Can the IP clause be limited to contributions to the core platform only?
4. What does "Customer use" mean in the indemnification clause — does it cover
   Vendor's own security failures?
5. Can the liability cap be raised to 12 months of fees for data breaches?
```

---

## Specialized Prompts by Contract Type

### NDA / Confidentiality Agreement

```python
NDA_PROMPT = """Analyze this NDA focusing on:
1. Definition of Confidential Information — is it too broad? Does it cover public info?
2. Exclusions — are standard exclusions present (public domain, independently developed, legally obtained)?
3. Duration — how long does confidentiality last? Is it perpetual?
4. Permitted disclosures — can you share with employees, contractors, advisors?
5. Return/destruction — what happens to confidential info on termination?
6. Residuals clause — can they use your ideas in their "unaided memory"?
Flag any mutual NDA that is actually one-sided."""
```

### Employment Agreement

```python
EMPLOYMENT_PROMPT = """Analyze this employment agreement focusing on:
1. Non-compete scope — geography, duration, industry. Is it enforceable in [state]?
2. Non-solicitation — employees and customers. Duration?
3. IP assignment — what work do they own? Does it extend to personal projects?
4. At-will vs. for-cause termination — what triggers termination for cause?
5. Severance — what are you owed on termination?
6. Garden leave — are you paid during the non-compete period?
Flag any clause that could prevent you from working in your field."""
```

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **This is not legal advice.** Claude can flag issues but cannot assess enforceability under your specific jurisdiction, recent case law, or your full negotiating context. Use this to prepare for a lawyer conversation, not replace it.
- **Long contracts hit context limits.** Contracts over 200 pages need chunking. Process by section and summarize.
- **Claude doesn't know your deal context.** A clause that looks risky might be acceptable given a lower price or other concessions. Add context to the prompt: *"We negotiated a 20% discount in exchange for..."*
- **Formatting varies.** Scanned PDFs, image-based PDFs, or poorly structured contracts reduce accuracy. OCR first with Tesseract if needed.

---

## Sources

- [Anthropic Files API](https://docs.anthropic.com/en/docs/build-with-claude/files)
- [PyMuPDF documentation](https://pymupdf.readthedocs.io)
- [Common contract red flags (Clerky)](https://www.clerky.com)
- [NVCA model legal documents](https://nvca.org/model-legal-documents/) — standard VC term sheets for comparison
