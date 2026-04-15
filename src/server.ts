#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { saveDecision } from "./tools/save-decision.js";
import { saveTask } from "./tools/save-task.js";
import { saveMeeting } from "./tools/save-meeting.js";
import { saveNote } from "./tools/save-note.js";
import { searchVaultTool } from "./tools/search-vault.js";
import { getPendingTasks } from "./tools/get-pending-tasks.js";
import { getVaultContext } from "./tools/get-vault-context.js";
import { updateIndex } from "./tools/update-index.js";

const server = new McpServer({
  name: "second-brain",
  version: "1.0.0",
});

// ── save_decision ──────────────────────────────────────────────────

server.tool(
  "save_decision",
  "Save a technical or process decision to the vault. Auto-creates people/project stubs and cross-links with [[wikilinks]].",
  {
    title: z.string().describe("Short descriptive title for the decision"),
    content: z.string().describe("The decision content — context, rationale, alternatives considered. Preserve the user's voice."),
    domain: z.array(z.string()).describe("Domain tags: backend, frontend, infra, devops, architecture, security, testing, process"),
    participants: z.array(z.string()).describe("People involved in the decision (names)"),
  },
  async (params) => {
    const result = saveDecision(params);
    return { content: [{ type: "text", text: result }] };
  }
);

// ── save_task ──────────────────────────────────────────────────────

server.tool(
  "save_task",
  "Save a task (tech debt, follow-up, idea, todo) to the vault. Auto-creates people/project stubs and cross-links.",
  {
    title: z.string().describe("Short descriptive title for the task"),
    content: z.string().describe("Task details — what needs to be done, context, acceptance criteria"),
    priority: z.string().default("p2-medium").describe("Priority: p0-critical, p1-high, p2-medium, p3-low"),
    status: z.string().default("open").describe("Status: open, in-progress, blocked, done, cancelled"),
    waiting_on: z.string().optional().describe("Who/what is this task blocked on"),
    due: z.string().optional().describe("Due date in YYYY-MM-DD format"),
    source: z.string().optional().describe("Where this task came from (meeting link, Slack thread, PR URL)"),
    tags: z.array(z.string()).optional().describe("Additional tags"),
  },
  async (params) => {
    const result = saveTask({
      ...params,
      tags: params.tags ?? [],
    });
    return { content: [{ type: "text", text: result }] };
  }
);

// ── save_meeting ───────────────────────────────────────────────────

server.tool(
  "save_meeting",
  "Save meeting notes to the vault. Auto-extracts action items as separate tasks, decisions as separate decision files. Cross-links everything.",
  {
    title: z.string().describe("Meeting topic/title"),
    content: z.string().describe("Meeting notes — discussion, decisions, action items. Preserve the user's voice."),
    attendees: z.array(z.string()).describe("People who attended the meeting"),
    project: z.string().optional().describe("Related project name"),
  },
  async (params) => {
    const result = saveMeeting(params);
    return { content: [{ type: "text", text: result }] };
  }
);

// ── save_note ──────────────────────────────────────────────────────

server.tool(
  "save_note",
  "Quick capture — auto-classifies content as decision, task, or meeting based on signal words, then routes to the correct save function.",
  {
    content: z.string().describe("Raw text to classify and save. Signal words determine type: 'decided/chose/went with' → decision, 'need to/should/follow up' → task, 'met with/standup/sync' → meeting."),
  },
  async (params) => {
    const result = saveNote(params);
    return { content: [{ type: "text", text: result }] };
  }
);

// ── search_vault ───────────────────────────────────────────────────

server.tool(
  "search_vault",
  "Search vault files by content and frontmatter. Returns matching entries with paths and previews.",
  {
    query: z.string().describe("Search query — matches against file names, frontmatter fields, and body content"),
    type: z.string().optional().describe("Filter by content type: decision, task, meeting, person, project"),
  },
  async (params) => {
    const result = searchVaultTool(params);
    return { content: [{ type: "text", text: result }] };
  }
);

// ── get_pending_tasks ──────────────────────────────────────────────

server.tool(
  "get_pending_tasks",
  "Get filtered list of tasks from the vault. Defaults to showing open/in-progress/blocked tasks, sorted by priority.",
  {
    status: z.string().optional().describe("Filter by status: open, in-progress, blocked, done, cancelled"),
    priority: z.string().optional().describe("Filter by priority: p0-critical, p1-high, p2-medium, p3-low"),
  },
  async (params) => {
    const result = getPendingTasks(params);
    return { content: [{ type: "text", text: result }] };
  }
);

// ── get_vault_context ──────────────────────────────────────────────

server.tool(
  "get_vault_context",
  "Cross-vault search for a topic. Finds all mentions across decisions, tasks, meetings, people, and projects. Use this to answer 'what do I know about X?'",
  {
    topic: z.string().describe("Topic to search for — a person name, project name, technology, concept, etc."),
  },
  async (params) => {
    const result = getVaultContext(params);
    return { content: [{ type: "text", text: result }] };
  }
);

// ── update_index ───────────────────────────────────────────────────

server.tool(
  "update_index",
  "Rebuild vault/index.md from current vault state. Run after manual edits or to fix index drift.",
  {},
  async () => {
    const result = updateIndex();
    return { content: [{ type: "text", text: result }] };
  }
);

// ── Start server ───────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});
