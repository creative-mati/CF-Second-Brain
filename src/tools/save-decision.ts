import { today } from "../utils/slug.js";
import { buildEntryPath, writeEntry, injectWikilinks } from "../utils/vault.js";
import { extractAndEnsureEntities } from "../utils/entities.js";
import { rebuildIndex } from "../utils/index-updater.js";
import path from "node:path";

export interface SaveDecisionParams {
  title: string;
  content: string;
  domain: string[];
  participants: string[];
}

export function saveDecision(params: SaveDecisionParams): string {
  const { title, content, domain, participants } = params;
  const filePath = buildEntryPath("decision", title);
  const fileName = path.basename(filePath, ".md");

  // Extract entities and ensure stubs exist
  const entities = extractAndEnsureEntities(content, participants);

  // Build frontmatter
  const frontmatter: Record<string, unknown> = {
    type: "decision",
    date: today(),
    status: "active",
    domain,
    participants: entities.people,
    related_decisions: [],
    tags: domain.map((d) => d.toLowerCase()),
  };

  // Build body with wikilinks
  let body = `## ${title}\n\n${content}\n`;

  // Add related entities section if any projects found
  if (entities.projects.length > 0) {
    body += "\n### Related Projects\n\n";
    for (const proj of entities.projects) {
      body += `- [[${proj}]]\n`;
    }
  }

  // Inject wikilinks for known entities
  body = injectWikilinks(body, [fileName]);

  writeEntry(filePath, frontmatter, body);

  // Rebuild index
  rebuildIndex();

  // Build response
  const created = [`decisions/${path.basename(filePath)}`];
  const stubs: string[] = [];
  for (const p of entities.people) stubs.push(`people/${p}.md`);
  for (const p of entities.projects) stubs.push(`projects/${p}.md`);

  return JSON.stringify({
    created: filePath,
    stubs_touched: stubs,
    message: `Decision saved: ${title}`,
    files: [filePath, ...stubs.map((s) => `vault/${s}`)],
  });
}
