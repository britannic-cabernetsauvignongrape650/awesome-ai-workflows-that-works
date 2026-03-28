import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const workflowsDir = path.join(repoRoot, "workflows");
const readmePath = path.join(repoRoot, "README.md");

function walkMarkdownFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function fail(message, errors) {
  errors.push(message);
}

function getFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  return match ? match[1] : null;
}

function getSourcesSection(text) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === "## Sources");
  if (start === -1) {
    return null;
  }

  const collected = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith("## ")) {
      break;
    }
    collected.push(line);
  }

  return collected.join("\n").trim();
}

const workflowFiles = walkMarkdownFiles(workflowsDir);
const workflowCount = workflowFiles.length;
const readme = readFileSync(readmePath, "utf8");
const errors = [];

const badgePattern = new RegExp(`img\\.shields\\.io/badge/workflows-${workflowCount}-blue`);
if (!badgePattern.test(readme)) {
  fail(
    `README badge count does not match workflow count (${workflowCount}).`,
    errors,
  );
}

const introPattern = new RegExp(`collection of ${workflowCount} AI workflows`, "i");
if (!introPattern.test(readme)) {
  fail(
    `README intro does not mention the current workflow count (${workflowCount}).`,
    errors,
  );
}

for (const file of workflowFiles) {
  const relPath = path.relative(repoRoot, file).replaceAll("\\", "/");
  const text = readFileSync(file, "utf8");
  const frontmatter = getFrontmatter(text);

  if (!frontmatter) {
    fail(`${relPath}: missing frontmatter block.`, errors);
    continue;
  }

  for (const key of ["name", "category", "difficulty", "tested"]) {
    const keyPattern = new RegExp(`^${key}:\\s*.+$`, "m");
    if (!keyPattern.test(frontmatter)) {
      fail(`${relPath}: missing frontmatter field "${key}".`, errors);
    }
  }

  const testedMatch = frontmatter.match(/^tested:\s*(true|false)\s*$/m);
  if (!testedMatch) {
    fail(`${relPath}: "tested" must be true or false.`, errors);
  }

  if (!/^## Validation$/m.test(text)) {
    fail(`${relPath}: missing "## Validation" section.`, errors);
  }

  if (!/^## Sources$/m.test(text)) {
    fail(`${relPath}: missing "## Sources" section.`, errors);
    continue;
  }

  const sourcesSection = getSourcesSection(text);
  if (!sourcesSection) {
    fail(`${relPath}: empty "## Sources" section.`, errors);
    continue;
  }

  const sourceLines = sourcesSection
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const sourceBullets = sourceLines.filter((line) => line.startsWith("- "));
  if (sourceBullets.length === 0) {
    fail(`${relPath}: "## Sources" must include at least one bullet link.`, errors);
  }

  for (const line of sourceBullets) {
    if (!/^- \[[^\]]+\]\([^)]+\)(?:\s+.+)?$/.test(line)) {
      fail(
        `${relPath}: source bullet must be a markdown link, found "${line}".`,
        errors,
      );
    }
  }

  if (testedMatch?.[1] === "false") {
    const validationSection = text.match(/^## Validation\r?\n([\s\S]*?)(?=^## |\Z)/m)?.[1] ?? "";
    if (!/\b(source|checked|validated|reviewed)\b/i.test(validationSection)) {
      fail(
        `${relPath}: tested=false workflows must explain what was validated in "## Validation".`,
        errors,
      );
    }
  }
}

if (errors.length > 0) {
  console.error("Workflow quality check failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Workflow quality check passed for ${workflowCount} workflow files.`);
