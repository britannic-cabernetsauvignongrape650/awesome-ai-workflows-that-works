---
name: Browser Automation — Tools & Workflows
category: dev
difficulty: intermediate
tools: Playwright, Browser-Use, Skyvern, Selenium, BAS, Puppeteer
tested: false
---

# Browser Automation — Tools & Workflows

> Automate anything that happens in a browser: scraping, testing, AI agents, form filling, monitoring, and more.

---

## Tool Categories

| Category | When to Use |
|----------|-------------|
| **AI Browser Agents** | Natural language → browser actions; complex tasks that require reasoning |
| **Playwright / Puppeteer** | Reliable, coded browser control; testing; scraping with JavaScript rendering |
| **Selenium** | Cross-browser testing; legacy project compatibility |
| **BAS** | Windows-based visual browser automation; mass form filling, scraping |
| **No-Code Tools** | Non-developers; repetitive browser tasks without scripting |

---

## AI Browser Agents

### Browser-Use
**GitHub:** [browser-use/browser-use](https://github.com/browser-use/browser-use) — 60K+ ⭐
**Type:** Python library · **Approach:** DOM + Vision (hybrid)

The most widely adopted open-source AI browser agent. Combines DOM parsing with vision models — understands both the structure and visual appearance of pages. Works with Claude, GPT-4, and Gemini.

```bash
pip install browser-use playwright
playwright install chromium
```

```python
from browser_use import Agent
from langchain_anthropic import ChatAnthropic

agent = Agent(
    task="Go to amazon.com, search for 'mechanical keyboard', filter by 4+ stars, and return the top 5 results with prices",
    llm=ChatAnthropic(model="claude-sonnet-4-6"),
)

async def main():
    result = await agent.run()
    print(result)
```

**Best for:** Web research, form automation, multi-step web tasks, competitive monitoring.

- [Docs](https://browser-use.com/docs)
- [Examples](https://github.com/browser-use/browser-use/tree/main/examples)

---

### Skyvern
**GitHub:** [Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern) — 10K+ ⭐
**Type:** Cloud + self-hosted · **Approach:** Pure vision LLM

Uses computer vision and LLMs to interpret browser screens visually. Doesn't depend on DOM selectors — works even on apps with obfuscated HTML or heavy JavaScript rendering.

```bash
git clone https://github.com/Skyvern-AI/skyvern.git
cd skyvern && docker compose up -d
```

**Best for:** Automating web apps where the DOM is unreliable; insurance portals, government sites, legacy enterprise apps.

- [skyvern.com](https://www.skyvern.com)

---

### Stagehand (Browserbase)
**GitHub:** [browserbase/stagehand](https://github.com/browserbase/stagehand) — 5K+ ⭐
**Type:** TypeScript library · **Approach:** AI-native Playwright wrapper

Wraps Playwright with three AI methods: `act()` (click, type, navigate), `extract()` (pull structured data), and `observe()` (see what's on the page). Falls back to standard Playwright for reliability.

```bash
npm install @browserbasehq/stagehand playwright
```

```typescript
import { Stagehand } from "@browserbasehq/stagehand";

const stagehand = new Stagehand({ env: "LOCAL" });
await stagehand.init();

await stagehand.page.goto("https://news.ycombinator.com");
await stagehand.act({ action: "click on the first story" });

const result = await stagehand.extract({
  instruction: "extract the top 10 story titles and their vote counts",
  schema: z.object({ stories: z.array(z.object({ title: z.string(), votes: z.number() })) })
});
```

- [stagehand.dev](https://www.stagehand.dev)

---

### Playwright MCP
**GitHub:** [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) — 10K+ ⭐
**Type:** MCP server · **Approach:** Gives Claude/any MCP client direct browser control

Exposes Playwright as an MCP server. Claude can navigate, click, type, screenshot, and scrape — directly from a conversation.

```json
// Add to claude_desktop_config.json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

Then in Claude: *"Go to competitor.com/pricing, screenshot the page, and extract all plan prices into a table."*

---

## Programmatic Browser Automation

### Playwright
**GitHub:** [microsoft/playwright](https://github.com/microsoft/playwright) — 68K+ ⭐
**Type:** Library (TypeScript, Python, .NET, Java)

The modern standard for browser automation. Supports Chromium, Firefox, and WebKit. Faster and more reliable than Selenium. Built-in support for:
- Auto-waiting (no manual `sleep()` calls)
- Network interception
- Mobile emulation
- Screenshots and video recording
- Parallel test execution

```bash
pip install playwright && playwright install
# or
npm install -D @playwright/test && npx playwright install
```

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://example.com")
    page.fill("#search", "browser automation")
    page.click("button[type=submit]")
    results = page.locator(".result-title").all_text_contents()
    print(results)
    browser.close()
```

- [playwright.dev](https://playwright.dev)

---

### Puppeteer
**GitHub:** [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer) — 88K+ ⭐
**Type:** Node.js library

Google's Node.js browser automation library. Controls Chrome/Chromium via the DevTools Protocol. Playwright is now preferred for new projects (wider browser support), but Puppeteer has a huge ecosystem of existing scripts and tutorials.

```bash
npm install puppeteer
```

```javascript
const puppeteer = require('puppeteer');
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://example.com');
const title = await page.title();
console.log(title);
await browser.close();
```

- [pptr.dev](https://pptr.dev)

---

### Selenium
**GitHub:** [SeleniumHQ/selenium](https://github.com/SeleniumHQ/selenium) — 30K+ ⭐
**Type:** Library (Python, Java, C#, Ruby, JavaScript)

The veteran of browser automation. Still widely used for cross-browser testing and in enterprise environments. Slower than Playwright with less ergonomic API, but unmatched ecosystem and documentation.

```bash
pip install selenium
```

```python
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("https://example.com")
element = driver.find_element(By.ID, "username")
element.send_keys("myuser")
driver.quit()
```

- [selenium.dev](https://www.selenium.dev)

---

## Windows Browser Automation (BAS)

### BAS — Browser Automation Studio
**Type:** Windows app · **Pricing:** Free (basic) / Premium plans
**Best for:** Visual browser automation without coding; form submission, data extraction, account management

BAS is a Windows application for creating browser automation scripts through a visual interface. Scripts (called "programs") support multi-threading, proxy rotation, captcha solving integrations, and anti-detection features.

**Capabilities:**
- Visual recorder for browser actions
- Multi-thread execution (run many instances in parallel)
- Proxy support and rotation
- Captcha solving integration (2captcha, anticaptcha)
- JavaScript execution within automation
- Variable management, loops, conditions
- Scheduling and background execution

**Use cases:** Form filling, web scraping, account registration, data extraction, automated testing.

- [bablosoft.com/shop/BrowserAutomationStudio](https://bablosoft.com/shop/BrowserAutomationStudio)
- [BAS documentation](https://wiki.bablosoft.com)
- [BAS forum](https://community.bablosoft.com)

---

### Axiom.ai
**Type:** Chrome extension + Cloud · **Pricing:** Free (limited) / from $10/mo
**Best for:** No-code browser automation recorded in-browser

Record browser actions as a Chrome extension, replay them on schedule or via API trigger. No coding required.

- [axiom.ai](https://axiom.ai)

---

### Browserflow
**Type:** Chrome extension · **Free tier:** Yes
**Best for:** Quick no-code browser automations for non-developers

- [browserflow.app](https://browserflow.app)

---

## Browser Infrastructure

### Browserbase
**Type:** Cloud · **Pricing:** Pay-per-use
**Best for:** Cloud browser infrastructure for AI agents at scale

Managed headless browser infrastructure. Processed 50M+ browser sessions in 2025. Used by AI agent teams who need reliable cloud browsers without managing their own fleet.

- [browserbase.com](https://www.browserbase.com)

---

### Apify
**Type:** Cloud + self-hosted · **Free tier:** Yes
**Best for:** Web scraping and automation at scale with pre-built "actors"

Full web automation platform. The Actor marketplace has 2,500+ pre-built scrapers for common sites (Google Maps, LinkedIn, Amazon, Instagram, etc.)

- [apify.com](https://apify.com)
- [Apify Actor store](https://apify.com/store)

---

## Testing Frameworks

### Cypress
**GitHub:** [cypress-io/cypress](https://github.com/cypress-io/cypress) — 46K+ ⭐
**Type:** JavaScript end-to-end testing

Popular for web app testing. Runs in the same run loop as the application — can access DOM, network requests, and storage directly. Good developer experience with time-travel debugging.

- [cypress.io](https://www.cypress.io)

---

### CodeceptJS
**GitHub:** [codeceptjs/CodeceptJS](https://github.com/codeceptjs/CodeceptJS) — 4K+ ⭐
**Type:** JavaScript BDD testing framework

BDD-style tests that read like natural language. Supports Playwright, Puppeteer, and WebDriver backends.

```javascript
Scenario('search on github', ({ I }) => {
  I.amOnPage('https://github.com');
  I.fillField('q', 'codeceptjs');
  I.pressKey('Enter');
  I.see('codeceptjs/CodeceptJS');
});
```

- [codecept.io](https://codecept.io)

---

## Useful Libraries

### Cheerio
**GitHub:** [cheeriojs/cheerio](https://github.com/cheeriojs/cheerio) — 28K+ ⭐
**Type:** Node.js library
**Best for:** HTML parsing and DOM manipulation without a browser

jQuery-like API for parsing and querying HTML in Node.js. Much faster than a full browser for static HTML scraping.

```javascript
const { load } = require('cheerio');
const $ = load('<h1>Hello World</h1>');
console.log($('h1').text()); // Hello World
```

---

### Firecrawl
**GitHub:** [mendableai/firecrawl](https://github.com/mendableai/firecrawl) — 24K+ ⭐
**Type:** API + Python/JS SDK
**Best for:** Clean Markdown extraction from any URL for AI processing

Turns any website into clean Markdown suitable for LLM input. Handles JavaScript rendering, authentication, and rate limits.

```python
from firecrawl import FirecrawlApp
app = FirecrawlApp(api_key="your_key")
result = app.scrape_url("https://docs.anthropic.com/en/docs/claude-code")
print(result['markdown'])
```

- [firecrawl.dev](https://www.firecrawl.dev)

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: unknown
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Sources

- [awesome-browser-automation (angrykoala)](https://github.com/angrykoala/awesome-browser-automation)
- [awesome-workflow-automation (dariubs)](https://github.com/dariubs/awesome-workflow-automation) — Browser automation section
- [Playwright documentation](https://playwright.dev/docs/intro)
- [Browser-Use documentation](https://browser-use.com/docs)
- [BAS wiki](https://wiki.bablosoft.com)
