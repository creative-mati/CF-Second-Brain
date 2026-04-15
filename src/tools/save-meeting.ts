import { today, slugify } from "../utils/slug.js";
import {
  buildEntryPath,
  writeEntry,
  injectWikilinks,
} from "../utils/vault.js";
import { extractAndEnsureEntities } from "../utils/entities.js";
import { rebuildIndex } from "../utils/index-updater.js";
import { DIRS } from "../utils/paths.js";
import path from "node:path";

export interface SaveMeetingParams {
  title: string;
  content: string;
  attendees: string[];
  project?: string;
}

interface ExtractedItem {
  type: "decision" | "task";
  text: string;
}

/**
 * Simple extraction of decisions and action items from meeting content.
 * Looks for signal words defined in the classification system.
 */
function extractItems(content: string): ExtractedItem[] {
  const items: ExtractedItem[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim().replace(/^[-*]\s*/, "").replace(/^\[.\]\s*/, "");
    if (!trimmed) continue;

    // Decision signals
    if (/\b(decided|chose|went with|agreed on|we're going with|settled on)\b/i.test(trimmed)) {
      items.push({ type: "decision", text: trimmed });
    }
    // Task signals
    else if (/\b(need to|should|todo|follow up|will|action item|look into)\b/i.test(trimmed)) {
      items.push({ type: "task", text: trimmed });
    }
  }

  return items;
}

export function saveMeeting(params: SaveMeetingParams): string {
  const { title, content, attendees, project } = params;
  const filePath = buildEntryPath("meeting", title);
  const fileName = path.basename(filePath, ".md");
  const dateStr = today();
  const createdFiles: string[] = [filePath];

  // Extract entities from content + attendees
  const explicitProjects = project ? [project] : [];
  const entities = extractAndEnsureEntities(content, attendees, explicitProjects);

  // Build meeting frontmatter
  const frontmatter: Record<string, unknown> = {
    type: "meeting",
    date: dateStr,
    attendees: entities.people,
    project: project ?? "",
    tags: [],
  };

  // Extract decisions and tasks from content
  const extractedItems = extractItems(content);
  const childLinks: string[] = [];

  // Create separate files for extracted items
  for (const item of extractedItems) {
    if (item.type === "decision") {
      const decSlug = slugify(item.text.slice(0, 60));
      const decPath = path.join(DIRS.decisions, `${dateStr}-${decSlug}.md`);
      const decName = path.basename(decPath, ".md");

      let decBody = `## ${item.text}\n\nFrom meeting: [[${fileName}]]\n`;
      decBody = injectWikilinks(decBody, [decName, fileName]);

      writeEntry(decPath, {
        type: "decision",
        date: dateStr,
        status: "active",
        domain: [],
        participants: entities.people,
        related_decisions: [],
        tags: [],
      }, decBody);

      createdFiles.push(decPath);
      childLinks.push(`- [[${decName}]] (decision)`);
    } else {
      const taskSlug = slugify(item.text.slice(0, 60));
      const taskPath = path.join(DIRS.tasks, `${dateStr}-${taskSlug}.md`);
      const taskName = path.basename(taskPath, ".md");

      let taskBody = `## ${item.text}\n\nFrom meeting: [[${fileName}]]\n`;
      taskBody = injectWikilinks(taskBody, [taskName, fileName]);

      writeEntry(taskPath, {
        type: "task",
        date: dateStr,
        status: "open",
        priority: "p2-medium",
        waiting_on: "",
        due: "",
        source: `[[${fileName}]]`,
        tags: [],
      }, taskBody);

      createdFiles.push(taskPath);
      childLinks.push(`- [[${taskName}]] (task)`);
    }
  }

  // Build meeting body
  let body = `## ${title}\n\n`;
  body += `### Attendees\n\n`;
  for (const person of entities.people) {
    body += `- [[${person}]]\n`;
  }
  body += "\n";

  body += `### Notes\n\n${content}\n`;

  if (childLinks.length > 0) {
    body += `\n### Extracted Items\n\n`;
    body += childLinks.join("\n") + "\n";
  }

  body = injectWikilinks(body, [fileName, ...entities.people]);

  writeEntry(filePath, frontmatter, body);

  // Rebuild index
  rebuildIndex();

  const stubs: string[] = [];
  for (const p of entities.people) stubs.push(`people/${p}.md`);
  for (const p of entities.projects) stubs.push(`projects/${p}.md`);

  return JSON.stringify({
    created: createdFiles,
    stubs_touched: stubs,
    extracted_decisions: extractedItems.filter((i) => i.type === "decision").length,
    extracted_tasks: extractedItems.filter((i) => i.type === "task").length,
    message: `Meeting saved: ${title} (${createdFiles.length} files created)`,
  });
}
