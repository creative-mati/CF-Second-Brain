import { listByType, type VaultEntry } from "../utils/vault.js";

export interface GetPendingTasksParams {
  status?: string;
  priority?: string;
}

function formatTask(entry: VaultEntry): object {
  const fm = entry.parsed.frontmatter;
  const lines = entry.parsed.body
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("---"));
  const preview = lines.slice(0, 2).join(" ").slice(0, 150);

  return {
    name: entry.name,
    path: entry.path,
    status: fm.status,
    priority: fm.priority,
    waiting_on: fm.waiting_on || null,
    due: fm.due || null,
    source: fm.source || null,
    date: fm.date,
    preview,
  };
}

export function getPendingTasks(params: GetPendingTasksParams): string {
  const allTasks = listByType("task");

  let filtered = allTasks;

  // Filter by status — default to all "active" statuses
  if (params.status) {
    filtered = filtered.filter(
      (t) => t.parsed.frontmatter.status === params.status
    );
  } else {
    // Default: show open, in-progress, and blocked
    filtered = filtered.filter((t) => {
      const s = t.parsed.frontmatter.status;
      return s === "open" || s === "in-progress" || s === "blocked";
    });
  }

  // Filter by priority
  if (params.priority) {
    filtered = filtered.filter(
      (t) => t.parsed.frontmatter.priority === params.priority
    );
  }

  // Sort by priority (p0 first)
  const priorityOrder = ["p0-critical", "p1-high", "p2-medium", "p3-low"];
  filtered.sort((a, b) => {
    const pa = priorityOrder.indexOf(String(a.parsed.frontmatter.priority ?? "p2-medium"));
    const pb = priorityOrder.indexOf(String(b.parsed.frontmatter.priority ?? "p2-medium"));
    return pa - pb;
  });

  return JSON.stringify({
    tasks: filtered.map(formatTask),
    count: filtered.length,
    message: filtered.length === 0
      ? "No matching tasks found."
      : `Found ${filtered.length} task(s).`,
  });
}
