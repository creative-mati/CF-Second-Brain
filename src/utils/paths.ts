import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vault root — configurable via VAULT_PATH env var, defaults to <repo-root>/vault/
export const VAULT_ROOT = process.env.VAULT_PATH
  ? path.resolve(process.env.VAULT_PATH)
  : path.resolve(__dirname, "../../vault");

export const DIRS = {
  decisions: path.join(VAULT_ROOT, "decisions"),
  tasks: path.join(VAULT_ROOT, "tasks"),
  meetings: path.join(VAULT_ROOT, "meetings"),
  people: path.join(VAULT_ROOT, "people"),
  projects: path.join(VAULT_ROOT, "projects"),
  weekly: path.join(VAULT_ROOT, "weekly"),
} as const;

export const INDEX_PATH = path.join(VAULT_ROOT, "index.md");

export type ContentType = "decision" | "task" | "meeting" | "person" | "project" | "weekly";

export function dirForType(type: ContentType): string {
  switch (type) {
    case "decision": return DIRS.decisions;
    case "task": return DIRS.tasks;
    case "meeting": return DIRS.meetings;
    case "person": return DIRS.people;
    case "project": return DIRS.projects;
    case "weekly": return DIRS.weekly;
  }
}
