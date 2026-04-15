/**
 * Entity extraction — pulls people and project names from content
 * and ensures stubs exist in the vault.
 */

import { ensurePersonStub, ensureProjectStub, listEntries } from "./vault.js";
import { DIRS } from "./paths.js";

export interface ExtractedEntities {
  /** Slugs of people stubs created/updated. */
  people: string[];
  /** Slugs of project stubs created/updated. */
  projects: string[];
}

/**
 * Extract entities from explicit lists (participants, attendees)
 * and from the body text, then ensure stubs exist.
 */
export function extractAndEnsureEntities(
  content: string,
  explicitPeople?: string[],
  explicitProjects?: string[]
): ExtractedEntities {
  const peopleSet = new Set<string>();
  const projectSet = new Set<string>();

  // 1. Explicit lists
  for (const name of explicitPeople ?? []) {
    if (name.trim()) {
      const slug = ensurePersonStub(name.trim());
      peopleSet.add(slug);
    }
  }

  for (const name of explicitProjects ?? []) {
    if (name.trim()) {
      const slug = ensureProjectStub(name.trim());
      projectSet.add(slug);
    }
  }

  // 2. Detect @mentions in content → people
  const atMentions = content.match(/@([\w-]+)/g);
  if (atMentions) {
    for (const mention of atMentions) {
      const name = mention.slice(1); // remove @
      const slug = ensurePersonStub(name);
      peopleSet.add(slug);
    }
  }

  // 3. Check if any existing project names appear in the content
  const existingProjects = listEntries(DIRS.projects);
  for (const proj of existingProjects) {
    const projName = proj.name.toLowerCase().replace(/-/g, " ");
    if (content.toLowerCase().includes(projName) || content.toLowerCase().includes(proj.name)) {
      projectSet.add(proj.name);
    }
  }

  // 4. Check if any existing people names appear in the content
  const existingPeople = listEntries(DIRS.people);
  for (const person of existingPeople) {
    const personName = person.name.toLowerCase().replace(/-/g, " ");
    if (content.toLowerCase().includes(personName) || content.toLowerCase().includes(person.name)) {
      peopleSet.add(person.name);
    }
  }

  return {
    people: [...peopleSet],
    projects: [...projectSet],
  };
}
