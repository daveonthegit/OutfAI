import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  generateMarkdownFromSchemaSource,
  normalizeMarkdown,
} from "../../scripts/generate-convex-docs";

const ROOT = process.cwd();
const SCHEMA_PATH = path.join(ROOT, "convex", "schema.ts");
const DOC_PATH = path.join(ROOT, "docs", "reference", "convex-schema.md");

describe("generate-convex-docs", () => {
  it("matches the checked-in reference doc after normalization", () => {
    const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
    const generated = generateMarkdownFromSchemaSource(schema);
    const checkedIn = fs.readFileSync(DOC_PATH, "utf8");

    expect(normalizeMarkdown(generated)).toBe(normalizeMarkdown(checkedIn));
  });

  it("ignores comment-only noise in the schema file", () => {
    const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
    const noisySchema = `${schema}\n// noise: v.string() and .index("fake", ["field"])\n/* more noise: defineTable({ phantom: v.number() }) */\n`;
    const generated = generateMarkdownFromSchemaSource(noisySchema);
    const checkedIn = fs.readFileSync(DOC_PATH, "utf8");

    expect(normalizeMarkdown(generated)).toBe(normalizeMarkdown(checkedIn));
  });
});
