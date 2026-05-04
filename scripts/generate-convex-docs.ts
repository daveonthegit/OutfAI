/**
 * generate-convex-docs.ts
 *
 * Reads convex/schema.ts and generates docs/reference/convex-schema.md.
 * Run: npm run gen:db-docs   (or: npx tsx scripts/generate-convex-docs.ts)
 *
 * Hooking into your workflow:
 *   - Pre-commit:  add "*.ts": ["npm run gen:db-docs", "git add docs/reference/convex-schema.md"]
 *                  for convex/schema.ts changes in lint-staged
 *   - CI:          the docs-consistency job re-runs this and fails on uncommitted changes
 */

import * as fs from "fs";
import * as path from "path";
import ts from "typescript";

const ROOT = path.resolve(__dirname, "..");
const SCHEMA_PATH = path.join(ROOT, "convex", "schema.ts");
const OUTPUT_PATH = path.join(ROOT, "docs", "reference", "convex-schema.md");

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

interface GenerateOptions {
  checkOnly?: boolean;
}

// ──────────────────────────────────────────────────────────────
// Parser
// ──────────────────────────────────────────────────────────────

/**
 * Resolve a validator expression into a human-readable string.
 * Handles Convex primitives plus custom validators.
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
  if (e.startsWith("v.literal(")) {
    const inner = unwrapParens(e.slice("v.literal(".length, -1));
    return inner;
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

function stripParentheses<T extends ts.Node>(node: T): ts.Node {
  let current: ts.Node = node;
  while (ts.isParenthesizedExpression(current)) {
    current = current.expression;
  }
  return current;
}

function isDefineSchemaCall(node: ts.Node): node is ts.CallExpression {
  return (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "defineSchema"
  );
}

function isDefineTableCall(node: ts.Node): node is ts.CallExpression {
  return (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "defineTable"
  );
}

function parseFields(body: ts.ObjectLiteralExpression): FieldDef[] {
  const fields: FieldDef[] = [];

  for (const property of body.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    if (!ts.isIdentifier(property.name)) continue;

    const rawType = property.initializer.getText().trim();
    const optional =
      rawType.startsWith("v.optional(") ||
      resolveType(rawType).includes("(optional)");

    fields.push({
      name: property.name.text,
      typeStr: resolveType(rawType),
      optional,
    });
  }

  return fields;
}

function parseIndexesFromChain(node: ts.Expression): IndexDef[] {
  const current = stripParentheses(node);

  if (
    ts.isCallExpression(current) &&
    ts.isPropertyAccessExpression(current.expression)
  ) {
    const indexes = parseIndexesFromChain(current.expression.expression);
    const method = current.expression.name.text;
    if (method === "index" || method === "searchIndex") {
      const nameArg = current.arguments[0];
      const fieldsArg = current.arguments[1];
      if (nameArg && fieldsArg && ts.isArrayLiteralExpression(fieldsArg)) {
        const name = nameArg.getText().replace(/['"]/g, "");
        const rawFields = fieldsArg.elements.map((field) =>
          field.getText().replace(/['"]/g, "")
        );
        indexes.push({ name, fields: rawFields, unique: false });
      }
    }
    return indexes;
  }

  return [];
}

function parseTables(src: string): TableDef[] {
  const sourceFile = ts.createSourceFile(
    SCHEMA_PATH,
    src,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const tables: TableDef[] = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isExportAssignment(statement)) continue;
    const schemaExpr = stripParentheses(statement.expression);
    if (!isDefineSchemaCall(schemaExpr)) continue;

    const schemaArg = schemaExpr.arguments[0];
    if (!schemaArg || !ts.isObjectLiteralExpression(schemaArg)) continue;

    for (const property of schemaArg.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      if (!ts.isIdentifier(property.name)) continue;

      const tableName = property.name.text;
      const value = stripParentheses(property.initializer);
      if (!ts.isCallExpression(value)) continue;

      let defineTableCall: ts.CallExpression | null = null;
      let chainRoot: ts.Expression = value;

      if (isDefineTableCall(value)) {
        defineTableCall = value;
      } else if (ts.isPropertyAccessExpression(value.expression)) {
        let current: ts.Expression = value;
        while (
          ts.isCallExpression(current) &&
          ts.isPropertyAccessExpression(current.expression)
        ) {
          if (
            current.expression.name.text === "index" ||
            current.expression.name.text === "searchIndex"
          ) {
            current = current.expression.expression;
            continue;
          }
          break;
        }
        if (isDefineTableCall(stripParentheses(current))) {
          defineTableCall = stripParentheses(current) as ts.CallExpression;
          chainRoot = value;
        }
      }

      if (!defineTableCall) continue;

      const bodyArg = defineTableCall.arguments[0];
      if (!bodyArg || !ts.isObjectLiteralExpression(bodyArg)) continue;

      const fields = parseFields(bodyArg);
      const indexes = parseIndexesFromChain(chainRoot);

      tables.push({ name: tableName, fields, indexes });
    }
  }

  return tables;
}

// ──────────────────────────────────────────────────────────────
// Markdown generator
// ──────────────────────────────────────────────────────────────

function generateMarkdown(tables: TableDef[]): string {
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
    `> Auto-generated from [\`convex/schema.ts\`](../../convex/schema.ts) by ` +
      `[\`scripts/generate-convex-docs.ts\`](../../scripts/generate-convex-docs.ts). ` +
      `Run \`npm run db:doc\` after schema changes and commit the result.`
  );
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

function normalizeMarkdown(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n+$/u, "\n");
}

function generateMarkdownFromSchemaSource(src: string): string {
  const tables = parseTables(src);
  return generateMarkdown(tables);
}

function verifyMarkdownOutput(markdown: string): boolean {
  if (!fs.existsSync(OUTPUT_PATH)) return false;
  const current = normalizeMarkdown(fs.readFileSync(OUTPUT_PATH, "utf-8"));
  return current === normalizeMarkdown(markdown);
}

// ──────────────────────────────────────────────────────────────
// Entry point
// ──────────────────────────────────────────────────────────────

function main(options: GenerateOptions = {}) {
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

  if (options.checkOnly) {
    if (!verifyMarkdownOutput(markdown)) {
      console.error(
        "✖  Generated convex schema docs differ from the checked-in file."
      );
      console.error("   Run `npm run db:doc` locally and commit the result.");
      process.exit(1);
    }
    console.log(`✓  Convex schema docs are up to date.`);
    return;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, normalizeMarkdown(markdown), "utf-8");

  console.log(
    `✓  Generated ${OUTPUT_PATH} with ${tables.length} collection(s) from Convex schema.`
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename)
) {
  main({ checkOnly: process.argv.includes("--check") });
}

export {
  generateMarkdown,
  generateMarkdownFromSchemaSource,
  normalizeMarkdown,
  parseTables,
};
