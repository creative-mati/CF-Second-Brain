/**
 * Rebuilds vault/index.md from the current state of all vault directories.
 */

import { INDEX_PATH } from "./paths.js";
import { listByType, writeEntry, type VaultEntry } from "./vault.js";
import { serializeFrontmatter } from "./frontmatter.js";
import { today } from "./slug.js";
import fs from "node:fs";

function summarizeEntry(entry: VaultEntry): string {
  // Extract first meaningful line from body as summary
  const lines = entry.parsed.body
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("---"));
  const summary = lines[0]?.trim().slice(0, 100) ?? "";
  return summary;
}

export function rebuildIndex(): string {
  const decisions = listByType("decision");
  const tasks = listByType("task");
  const meetings = listByType("meeting");
  const people = listByType("person");
  const projects = listByType("project");
  const weekly = listByType("weekly");

  // Gather all entries sorted by date (newest first) for recent list
  const allDated = [...decisions, ...tasks, ...meetings]
    .sort((a, b) => {
      const dateA = String(a.parsed.frontmatter.date ?? "");
      const dateB = String(b.parsed.frontmatter.date ?? "");
      return dateB.localeCompare(dateA);
    })
    .slice(0, 15);

  // Active projects
  const activeProjects = projects.filter(
    (p) => p.parsed.frontmatter.status === "active"
  );

  // Open tasks grouped by priority
  const openTasks = tasks.filter((t) => {
    const status = t.parsed.frontmatter.status;
    return status === "open" || status === "in-progress" || status === "blocked";
  });

  const tasksByPriority = new Map<string, VaultEntry[]>();
  for (const t of openTasks) {
    const priority = String(t.parsed.frontmatter.priority ?? "p2-medium");
    if (!tasksByPriority.has(priority)) tasksByPriority.set(priority, []);
    tasksByPriority.get(priority)!.push(t);
  }

  const priorityOrder = ["p0-critical", "p1-high", "p2-medium", "p3-low"];

  // Build body
  const lines: string[] = [];

  lines.push("## Work Second Brain");
  lines.push("");
  lines.push("Personal knowledge base for capturing decisions, tasks, and meeting notes.");
  lines.push("");

  // Stats
  lines.push("### Vault Stats");
  lines.push("");
  lines.push("| Type | Count |");
  lines.push("|------|-------|");
  lines.push(`| Decisions | ${decisions.length} |`);
  lines.push(`| Tasks | ${tasks.length} |`);
  lines.push(`| Meetings | ${meetings.length} |`);
  lines.push(`| People | ${people.length} |`);
  lines.push(`| Projects | ${projects.length} |`);
  lines.push(`| Weekly Reviews | ${weekly.length} |`);
  lines.push("");

  // Recent entries
  lines.push("### Recent Entries");
  lines.push("");
  for (const entry of allDated) {
    const summary = summarizeEntry(entry);
    const summaryText = summary ? ` — ${summary}` : "";
    lines.push(`- [[${entry.name}]]${summaryText}`);
  }
  lines.push("");

  // Active projects
  if (activeProjects.length > 0) {
    lines.push("### Active Projects");
    lines.push("");
    for (const p of activeProjects) {
      const summary = summarizeEntry(p);
      const summaryText = summary ? ` — ${summary}` : "";
      lines.push(`- [[${p.name}]]${summaryText}`);
    }
    lines.push("");
  }

  // Open tasks by priority
  if (openTasks.length > 0) {
    lines.push("### Open Tasks by Priority");
    lines.push("");
    for (const priority of priorityOrder) {
      const tasksForPriority = tasksByPriority.get(priority);
      if (!tasksForPriority || tasksForPriority.length === 0) continue;

      const label = priority.replace("-", " — ").replace("p0", "**P0").replace("p1", "**P1").replace("p2", "**P2").replace("p3", "**P3") + "**";
      lines.push(label);
      for (const t of tasksForPriority) {
        const summary = summarizeEntry(t);
        const summaryText = summary ? ` — ${summary}` : "";
        lines.push(`- [[${t.name}]]${summaryText}`);
      }
      lines.push("");
    }
  }

  // People index
  if (people.length > 0) {
    lines.push("### People");
    lines.push("");
    for (const p of people) {
      const role = p.parsed.frontmatter.role ? ` — ${p.parsed.frontmatter.role}` : "";
      lines.push(`- [[${p.name}]]${role}`);
    }
    lines.push("");
  }

  const body = lines.join("\n");
  const frontmatter = {
    type: "index",
    last_updated: today(),
  };

  const content = serializeFrontmatter(frontmatter, body);
  fs.writeFileSync(INDEX_PATH, content, "utf-8");

  return content;
}
