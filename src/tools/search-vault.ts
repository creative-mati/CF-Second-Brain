import { searchVault, type VaultEntry } from "../utils/vault.js";
import type { ContentType } from "../utils/paths.js";
import path from "node:path";

export interface SearchVaultParams {
  query: string;
  type?: string;
}

function summarizeEntry(entry: VaultEntry): object {
  const lines = entry.parsed.body
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("---"));
  const preview = lines.slice(0, 3).join("\n").slice(0, 200);

  return {
    name: entry.name,
    path: entry.path,
    type: entry.parsed.frontmatter.type,
    date: entry.parsed.frontmatter.date,
    status: entry.parsed.frontmatter.status,
    preview,
  };
}

export function searchVaultTool(params: SearchVaultParams): string {
  const validTypes = ["decision", "task", "meeting", "person", "project"];
  const type = params.type && validTypes.includes(params.type)
    ? (params.type as ContentType)
    : undefined;

  const results = searchVault(params.query, type);

  if (results.length === 0) {
    return JSON.stringify({
      results: [],
      message: `No results found for "${params.query}"${type ? ` in ${type}s` : ""}.`,
    });
  }

  return JSON.stringify({
    results: results.map(summarizeEntry),
    count: results.length,
    message: `Found ${results.length} result(s) for "${params.query}".`,
  });
}
