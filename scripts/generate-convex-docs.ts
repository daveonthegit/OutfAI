/**
 * generate-convex-docs.ts
 *
 * Reads convex/schema.ts and generates docs/convex-schema.md.
 * Run: npm run gen:db-docs   (or: npx tsx scripts/generate-convex-docs.ts)
 *
 * Hooking into your workflow:
 *   - Pre-commit:  add "*.ts": ["npm run gen:db-docs", "git add docs/convex-schema.md"]
 *                  for convex/schema.ts changes in lint-staged
 *   - CI:          the docs-consistency job re-runs this and fails on uncommitted changes
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const SCHEMA_PATH = path.join(ROOT, "convex", "schema.ts");
const OUTPUT_PATH = path.join(ROOT, "docs", "convex-schema.md");

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface FieldDef {
  name: string;
  typeStr: string;
  optional: boolean;
}

interface IndexDef {
  name: string;
  fields: string[];
  unique: boolean;
}

interface TableDef {
  name: string;
  fields: FieldDef[];
  indexes: IndexDef[];
}

// ──────────────────────────────────────────────────────────────
// Parser
// ──────────────────────────────────────────────────────────────

/**
 * Resolve a v.* type expression into a human-readable string.
 * Handles: string, number, boolean, id("table"), array(...),
 *          optional(...), union(...), object({...})
 */
function resolveType(expr: string): string {
  const e = expr.trim();

  if (e.startsWith("v.optional(")) {
    const inner = unwrapParens(e.slice("v.optional(".length, -1));
    return `${resolveType(inner)} (optional)`;
  }
  if (e.startsWith("v.array(")) {
    const inner = unwrapParens(e.slice("v.array(".length, -1));
    return `array<${resolveType(inner)}>`;
  }
  if (e.startsWith("v.id(")) {
    const ref = e.slice("v.id(".length, -1).replace(/['"]/g, "");
    return `id<${ref}>`;
  }
  if (e.startsWith("v.union(")) {
    const inner = e.slice("v.union(".length, -1);
    const parts = splitTopLevel(inner).map(resolveType);
    return parts.join(" | ");
  }
  if (e.startsWith("v.object(")) return "object";
  if (e === "v.string()") return "string";
  if (e === "v.number()") return "number";
  if (e === "v.boolean()") return "boolean";
  if (e === "v.int64()") return "int64";
  if (e === "v.float64()") return "float64";
  if (e === "v.bytes()") return "bytes";
  if (e === "v.null()") return "null";
  if (e === "v.any()") return "any";
  return e;
}

/** Remove balanced outer parens if present */
function unwrapParens(s: string): string {
  const t = s.trim();
  if (t.startsWith("(") && t.endsWith(")")) return t.slice(1, -1).trim();
  return t;
}

/** Split a comma-separated list at the top level (ignoring nested parens/braces) */
function splitTopLevel(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(" || ch === "{" || ch === "[") depth++;
    else if (ch === ")" || ch === "}" || ch === "]") depth--;
    else if (ch === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

/**
 * Extract the body of a defineTable({ ... }) call from the schema source.
 * Returns the raw content between the outermost braces of the object arg.
 */
function extractTableBody(src: string, startIdx: number): string {
  let depth = 0;
  let inBody = false;
  let body = "";
  for (let i = startIdx; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") {
      if (!inBody) {
        inBody = true;
        depth = 1;
        continue;
      }
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) break;
    }
    if (inBody) body += ch;
  }
  return body;
}

/**
 * Extract the full defineTable(...) call text starting at `startIdx`,
 * up to and including the matching closing paren.
 */
function extractCallText(src: string, startIdx: number): string {
  let depth = 0;
  let started = false;
  let result = "";
  for (let i = startIdx; i < src.length; i++) {
    const ch = src[i];
    if (ch === "(") {
      depth++;
      started = true;
    } else if (ch === ")") {
      depth--;
    }
    result += ch;
    if (started && depth === 0) break;
  }
  return result;
}

/**
 * Parse field definitions from the body of a defineTable({}) object.
 */
function parseFields(body: string): FieldDef[] {
  const fields: FieldDef[] = [];

  // Match lines like:   fieldName: v.something(...),
  const fieldRegex = /(\w+)\s*:\s*(v\.[^,\n]+)/g;
  let m: RegExpExecArray | null;

  while ((m = fieldRegex.exec(body)) !== null) {
    const name = m[1];
    const rawType = m[2].trim().replace(/,$/, "").trim();
    const optional =
      rawType.startsWith("v.optional(") ||
      resolveType(rawType).includes("(optional)");
    fields.push({ name, typeStr: resolveType(rawType), optional });
  }

  return fields;
}

/**
 * Parse .index("name", ["field1", "field2"]) calls from the tail of a
 * defineTable(...) chain (the text after the closing paren of the object arg).
 */
function parseIndexes(chainText: string): IndexDef[] {
  const indexes: IndexDef[] = [];
  const idxRegex =
    /\.(index|searchIndex)\(\s*["']([^"']+)["']\s*,\s*\[([^\]]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = idxRegex.exec(chainText)) !== null) {
    const name = m[2];
    const rawFields = m[3].split(",").map((f) => f.trim().replace(/['"]/g, ""));
    indexes.push({ name, fields: rawFields, unique: false });
  }
  return indexes;
}

function parseTables(src: string): TableDef[] {
  const tables: TableDef[] = [];

  // Match:  tableName: defineTable(
  const tableRegex = /(\w+)\s*:\s*defineTable\s*\(/g;
  let m: RegExpExecArray | null;

  while ((m = tableRegex.exec(src)) !== null) {
    const tableName = m[1];
    if (tableName === "export" || tableName === "const") continue;

    const callStart = m.index + m[0].length - 1; // points at '('
    const callText = extractCallText(src, callStart);

    const bodyStart = callText.indexOf("{");
    if (bodyStart === -1) continue;
    const body = extractTableBody(callText, bodyStart);

    const fields = parseFields(body);
    const indexes = parseIndexes(callText);

    tables.push({ name: tableName, fields, indexes });
  }

  return tables;
}

// ──────────────────────────────────────────────────────────────
// Markdown generator
// ──────────────────────────────────────────────────────────────

function generateMarkdown(tables: TableDef[]): string {
  const now = new Date().toISOString().split("T")[0];
  const lines: string[] = [];

  lines.push(`<!--`);
  lines.push(`  ╔══════════════════════════════════════════════════════════╗`);
  lines.push(`  ║  GENERATED FILE — DO NOT EDIT MANUALLY                  ║`);
  lines.push(`  ║                                                         ║`);
  lines.push(`  ║  Source: convex/schema.ts                               ║`);
  lines.push(`  ║  Command: npm run gen:db-docs                           ║`);
  lines.push(`  ╚══════════════════════════════════════════════════════════╝`);
  lines.push(`-->`);
  lines.push(``);
  lines.push(`# OutfAI — Convex Schema`);
  lines.push(``);
  lines.push(
    `> Auto-generated from [\`convex/schema.ts\`](../convex/schema.ts) by ` +
      `[\`scripts/generate-convex-docs.ts\`](../scripts/generate-convex-docs.ts).`
  );
  lines.push(`> Last generated: ${now}`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  // Table of contents
  lines.push(`## Collections`);
  lines.push(``);
  for (const t of tables) {
    lines.push(`- [\`${t.name}\`](#${t.name})`);
  }
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  // Per-table detail
  for (const t of tables) {
    lines.push(`## \`${t.name}\``);
    lines.push(``);

    if (t.fields.length > 0) {
      lines.push(`| Field | Type | Required |`);
      lines.push(`|-------|------|----------|`);
      for (const f of t.fields) {
        const optional = f.optional || f.typeStr.includes("(optional)");
        const displayType = f.typeStr.replace(" (optional)", "");
        lines.push(
          `| \`${f.name}\` | \`${displayType}\` | ${optional ? "no" : "yes"} |`
        );
      }
      lines.push(``);
    }

    if (t.indexes.length > 0) {
      lines.push(`**Indexes:**`);
      for (const idx of t.indexes) {
        lines.push(
          `- \`${idx.name}\` on (${idx.fields.map((f) => `\`${f}\``).join(", ")})`
        );
      }
      lines.push(``);
    }

    lines.push(`---`);
    lines.push(``);
  }

  return lines.join("\n");
}

// ──────────────────────────────────────────────────────────────
// Entry point
// ──────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(`✖  Schema not found at ${SCHEMA_PATH}`);
    process.exit(1);
  }

  const src = fs.readFileSync(SCHEMA_PATH, "utf-8");
  const tables = parseTables(src);

  if (tables.length === 0) {
    console.warn(`⚠  No tables found in ${SCHEMA_PATH}`);
    process.exit(1);
  }

  const markdown = generateMarkdown(tables);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, markdown, "utf-8");

  console.log(
    `✓  Generated ${OUTPUT_PATH} with ${tables.length} collection(s) from Convex schema.`
  );
}

main();
