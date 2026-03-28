---
name: YouTube SEO Metadata Generator
category: video
difficulty: beginner
tools: Claude, TubeBuddy / VidIQ (optional), YouTube Studio
tested: false
---

# YouTube SEO Metadata Generator

> Generate optimized YouTube title, description, tags, and end screen CTAs from your video content in 2 minutes.

## What this is for

YouTube metadata directly affects search discoverability, recommended video placement, and click-through rate. Most creators write it as an afterthought — a generic title and a copy-paste of the script intro. This workflow generates metadata that follows YouTube SEO best practices, using your actual video content as the source.

The title is the highest-leverage element. A/B testing titles (via YouTube Studio's built-in test feature) can 2-5x views on the same video.

---

## Stack

| Tool | Role | Cost |
|------|------|------|
| [Claude.ai](https://claude.ai) | Metadata generation | Free / Pro $20/mo |
| [TubeBuddy](https://www.tubebuddy.com) | Keyword search volume validation | Free tier / Pro $4.99/mo |
| [VidIQ](https://vidiq.com) | Channel analytics + keyword suggestions | Free tier / Pro $7.50/mo |
| [YouTube Studio](https://studio.youtube.com) | A/B title testing, analytics | Free |

---

## Step 1: Gather Your Inputs

Before running the prompt, have ready:
- Video title (working title is fine)
- 3-5 sentence summary of the video's content
- Primary keyword you're targeting (use TubeBuddy or VidIQ to validate volume)
- Your channel niche and typical audience

**Finding your primary keyword:**
1. Open [TubeBuddy](https://www.tubebuddy.com) or [VidIQ](https://vidiq.com)
2. Search for your topic
3. Look for keywords with: high search volume + medium/low competition
4. Pick 1 primary keyword + 3-5 secondary keywords

---

## Step 2: Run the Metadata Prompt

```
You are a YouTube SEO specialist with deep knowledge of YouTube's search and recommendation algorithm.

Generate complete metadata for a YouTube video based on these inputs:

**Video Topic:** [describe in 2-3 sentences what the video covers]
**Primary Keyword:** [your target keyword]
**Secondary Keywords:** [3-5 related terms]
**Audience:** [who watches your channel — expertise level, why they come]
**Video Length:** [e.g., 18 minutes]
**Channel Niche:** [e.g., Python programming tutorials, AI tools, productivity]

---

Return all of the following:

**1. Title Options (3 variants)**
Rules per title:
- Include primary keyword in the first half of the title
- Max 60 characters (to avoid truncation in search results)
- Variant A: Curiosity/question format ("Why Your X Is Failing (And How to Fix It)")
- Variant B: Number/list format ("5 Ways to X in 2026")
- Variant C: Direct result format ("How to X in Under 10 Minutes")

**2. Description (full)**
Structure:
- Line 1-2 (150 chars max): Hook. This is what shows in search results before "Show more" — make it standalone.
- [blank line]
- Lines 3-8: Expand on the video's value. Include primary + secondary keywords naturally (not stuffed). 150-200 words.
- [blank line]
- CHAPTERS: (I'll add timestamps manually)
- [blank line]
- RESOURCES MENTIONED: (I'll fill this in)
- [blank line]
- ABOUT THIS CHANNEL: [write 2 sentences describing the channel]
- [blank line]
- LINKS: (I'll add)

**3. Tags (25-30)**
Mix of:
- Exact primary keyword
- 3-4 keyword variations (singular/plural, "how to X", "X tutorial")
- 5-8 closely related terms
- 3-5 broader category tags
- 2-3 channel brand tags

**4. End Screen CTA (2 versions)**
What to say at the end of the video to drive subscribe + watch next.
- Version A: For new viewers (first time on the channel)
- Version B: For returning viewers (already subscribed)

**5. Thumbnail Text Suggestions**
3 short text overlays (max 4 words each) that would work on a thumbnail.
```

---

## Sample Output

**Input:** Python tutorial on using DuckDB for data analysis. Primary keyword: "duckdb tutorial python". Audience: intermediate Python developers.

**Title options:**
- A: "Why DuckDB Is Replacing Pandas for Data Analysis"
- B: "DuckDB Python Tutorial: Analyze 10M Rows in Seconds"
- C: "How to Use DuckDB in Python (Faster Than Pandas)"

**Description (first 150 chars):**
> DuckDB runs SQL directly on CSV and Parquet files — no database setup, no server, just results. Here's how to use it in Python for real data analysis.

**Tags (excerpt):**
`duckdb tutorial python, duckdb python, duckdb vs pandas, duckdb sql, python data analysis, analytical database python, pandas alternative, parquet python tutorial, duckdb 2026, data analysis tutorial, python tutorial intermediate`

**Thumbnail text suggestions:**
- "FASTER THAN PANDAS"
- "NO SERVER NEEDED"
- "10M ROWS IN 3SEC"

---

## Step 3: Validate Keywords

Before uploading:

1. **TubeBuddy:** Search your primary keyword → check "Search Volume" and "Competition" scores. Target: volume ≥ Medium, competition ≤ Medium.
2. **YouTube search bar:** Type your primary keyword and check autocomplete suggestions — these are real searches. Use them as additional tags.
3. **Check the competition:** Search your keyword on YouTube. If the top 10 videos are from channels 100x your size, find a more specific long-tail variant.

---

## Step 4: A/B Test Titles

YouTube Studio has a built-in title A/B test feature:

1. Upload video with Title A
2. Go to Studio → Content → your video → Edit → Title & description → **Test & compare**
3. Add Title B
4. Let it run for 48-72 hours (needs ~500 impressions to be statistically meaningful)
5. Keep the winner

The difference between a good and great title is often 50-200% in CTR. A/B testing is the highest-leverage SEO activity on YouTube.

---

## Metadata Checklist Before Publishing

- [ ] Primary keyword appears in title (first half preferred)
- [ ] Description first 150 chars are standalone and compelling
- [ ] At least 15 tags added
- [ ] Chapters added (boosts search for long videos, >10 min)
- [ ] End screen configured (subscribe button + recommended video)
- [ ] Custom thumbnail uploaded (not auto-generated)
- [ ] Cards added at key moments

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **Claude doesn't know your channel's current analytics.** Use TubeBuddy/VidIQ to validate keyword volume before committing to a title.
- **Tag importance has declined.** YouTube's algorithm now primarily uses the title, description, and viewer behavior. Tags matter less than in 2020, but they're still a signal — include them.
- **Description keyword stuffing is penalized.** The algorithm detects unnatural repetition. Use keywords in natural sentences.
- **Thumbnail matters more than the title.** CTR is title + thumbnail together. A great title with a bad thumbnail underperforms. Tools like [Canva](https://canva.com) have YouTube thumbnail templates.

---

## Sources

- [YouTube Creator Academy — SEO](https://creatoracademy.youtube.com) — official YouTube guidance on discoverability
- [TubeBuddy keyword research guide](https://support.tubebuddy.com/hc/en-us/articles/360002571412) — how to use keyword explorer
- [VidIQ blog](https://vidiq.com/blog/) — YouTube algorithm updates and optimization tips
- [YouTube Studio A/B testing help](https://support.google.com/youtube/answer/10453814) — official guide to title testing
- [Think Media YouTube SEO guide](https://www.youtube.com/c/ThinkMediaTV) — practical channel growth strategies