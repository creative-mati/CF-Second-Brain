/**
 * Minimal YAML frontmatter parser/serializer.
 * Handles the subset of YAML used in our vault (scalars, arrays, simple strings).
 * No external dependencies — just string manipulation.
 */

export interface ParsedFile {
  frontmatter: Record<string, unknown>;
  body: string;
}

/** Parse a markdown file with YAML frontmatter into structured data. */
export function parseFrontmatter(content: string): ParsedFile {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith("---")) {
    return { frontmatter: {}, body: content };
  }

  const endIndex = trimmed.indexOf("---", 3);
  if (endIndex === -1) {
    return { frontmatter: {}, body: content };
  }

  const yamlBlock = trimmed.slice(3, endIndex).trim();
  const body = trimmed.slice(endIndex + 3).replace(/^\r?\n/, "");
  const frontmatter: Record<string, unknown> = {};

  for (const line of yamlBlock.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value: unknown = line.slice(colonIndex + 1).trim();

    // Handle YAML inline arrays: [a, b, c]
    if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
      const inner = value.slice(1, -1).trim();
      if (inner === "") {
        value = [];
      } else {
        value = inner.split(",").map((s) => s.trim());
      }
    }
    // Handle quoted strings
    else if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    // Handle empty string
    else if (value === '""' || value === "''") {
      value = "";
    }

    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

/** Serialize frontmatter + body back to a markdown string. */
export function serializeFrontmatter(
  frontmatter: Record<string, unknown>,
  body: string
): string {
  const lines: string[] = ["---"];

  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.join(", ")}]`);
    } else if (value === "" || value === null || value === undefined) {
      lines.push(`${key}: ""`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push("---");
  lines.push("");

  return lines.join("\n") + body;
}
