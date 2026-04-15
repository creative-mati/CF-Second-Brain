import { searchVault, readEntry, type VaultEntry } from "../utils/vault.js";
import { DIRS } from "../utils/paths.js";
import path from "node:path";
import fs from "node:fs";

export interface GetVaultContextParams {
  topic: string;
}

function entrySnapshot(entry: VaultEntry): object {
  return {
    name: entry.name,
    type: entry.parsed.frontmatter.type,
    date: entry.parsed.frontmatter.date,
    status: entry.parsed.frontmatter.status,
    body: entry.parsed.body.slice(0, 500),
  };
}

/**
 * Cross-vault search: finds all mentions of a topic across every content type,
 * then returns a structured synthesis.
 */
export function getVaultContext(params: GetVaultContextParams): string {
  const { topic } = params;
  const topicLower = topic.toLowerCase();

  // Search across all types
  const allMatches = searchVault(topic);

  // Group by type
  const grouped: Record<string, object[]> = {};
  for (const entry of allMatches) {
    const type = String(entry.parsed.frontmatter.type ?? "unknown");
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(entrySnapshot(entry));
  }

  // Also check if the topic matches a person or project directly
  const personPath = path.join(DIRS.people, `${topic.toLowerCase().replace(/\s+/g, "-")}.md`);
  const projectPath = path.join(DIRS.projects, `${topic.toLowerCase().replace(/\s+/g, "-")}.md`);

  let directMatch: object | null = null;

  if (fs.existsSync(personPath)) {
    const entry = readEntry(personPath);
    if (entry) directMatch = { ...entrySnapshot(entry), match_type: "person" };
  } else if (fs.existsSync(projectPath)) {
    const entry = readEntry(projectPath);
    if (entry) directMatch = { ...entrySnapshot(entry), match_type: "project" };
  }

  return JSON.stringify({
    topic,
    direct_match: directMatch,
    mentions: grouped,
    total_mentions: allMatches.length,
    message: allMatches.length === 0
      ? `No mentions of "${topic}" found in the vault.`
      : `Found ${allMatches.length} mention(s) of "${topic}" across the vault.`,
  });
}
