#!/usr/bin/env node
/**
 * Creates GitHub issues from docs/archive/issues/*.md.
 * Requires: GITHUB_TOKEN env var (with repo scope).
 * Usage: node scripts/create-github-issues.js
 *   Or:  GITHUB_TOKEN=xxx node scripts/create-github-issues.js
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const REPO_OWNER = "daveonthegit";
const REPO_NAME = "OutfAI";
const ISSUES_DIR = path.join(__dirname, "..", "docs", "archive", "issues");

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error(
    "Set GITHUB_TOKEN (e.g. export GITHUB_TOKEN=ghp_...) and run again."
  );
  process.exit(1);
}

function parseIssueFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split("\n");
  const titleMatch = raw.match(/^#\s+(.+?)(?:\s*\{#|\n)/m);
  const title = titleMatch
    ? titleMatch[1].trim()
    : path.basename(filePath, ".md");
  const labelsMatch = raw.match(/\*\*Labels:\*\*\s*(.+)/);
  const labelsStr = labelsMatch ? labelsMatch[1].trim() : "";
  const labels = labelsStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const body = raw.replace(/^#\s+.+?\n\n/, "").trim();
  return { title, body, labels };
}

function createIssue(title, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title, body });
    const options = {
      hostname: "api.github.com",
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: `Bearer ${token}`,
        "User-Agent": "OutfAI-script",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (ch) => (data += ch));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const json = JSON.parse(data);
          resolve({ number: json.number, url: json.html_url });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const files = fs.readdirSync(ISSUES_DIR).filter((f) => f.endsWith(".md"));
  const sorted = files.sort((a, b) => {
    const na = parseInt(a.split("-")[0], 10);
    const nb = parseInt(b.split("-")[0], 10);
    return na - nb;
  });

  console.log(
    `Creating ${sorted.length} issues in ${REPO_OWNER}/${REPO_NAME}...\n`
  );
  for (const file of sorted) {
    const filePath = path.join(ISSUES_DIR, file);
    const { title, body } = parseIssueFile(filePath);
    try {
      const result = await createIssue(title, body);
      console.log(`#${result.number} ${title} -> ${result.url}`);
    } catch (e) {
      console.error(`Failed ${file}:`, e.message);
    }
  }
  console.log("\nDone.");
}

main();
