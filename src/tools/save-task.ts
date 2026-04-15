import { today } from "../utils/slug.js";
import { buildEntryPath, writeEntry, injectWikilinks } from "../utils/vault.js";
import { extractAndEnsureEntities } from "../utils/entities.js";
import { rebuildIndex } from "../utils/index-updater.js";
import path from "node:path";

export interface SaveTaskParams {
  title: string;
  content: string;
  priority?: string;
  status?: string;
  waiting_on?: string;
  due?: string;
  source?: string;
  tags?: string[];
}

export function saveTask(params: SaveTaskParams): string {
  const {
    title,
    content,
    priority = "p2-medium",
    status = "open",
    waiting_on = "",
    due = "",
    source = "",
    tags = [],
  } = params;

  const filePath = buildEntryPath("task", title);
  const fileName = path.basename(filePath, ".md");

  // Extract entities
  const entities = extractAndEnsureEntities(content);

  // Build frontmatter
  const frontmatter: Record<string, unknown> = {
    type: "task",
    date: today(),
    status,
    priority,
    waiting_on,
    due,
    source,
    tags,
  };

  // Build body with wikilinks
  let body = `## ${title}\n\n${content}\n`;
  body = injectWikilinks(body, [fileName]);

  writeEntry(filePath, frontmatter, body);

  // Rebuild index
  rebuildIndex();

  const stubs: string[] = [];
  for (const p of entities.people) stubs.push(`people/${p}.md`);
  for (const p of entities.projects) stubs.push(`projects/${p}.md`);

  return JSON.stringify({
    created: filePath,
    stubs_touched: stubs,
    message: `Task saved: ${title} [${priority}, ${status}]`,
  });
}
