# CF Second Brain

An MCP server that gives your AI coding assistant persistent memory through an Obsidian vault. Decisions, tasks, and meeting notes survive across sessions and become searchable, linked knowledge.

```
You: sb met with carlos and priya about search. decided on elasticsearch over solr.
     need to set up staging cluster by friday.

AI:  Saved 4 files:
     - meetings/2026-04-15-meeting-search-service-sync.md
     - decisions/2026-04-15-elasticsearch-over-solr.md
     - tasks/2026-04-15-setup-staging-cluster.md (due: 2026-04-18, p1-high)
     + people stubs: carlos.md, priya.md
```

## What it does

| Tool | Description |
|------|-------------|
| `save_decision` | Save a technical/process decision with context, rationale, and participants |
| `save_task` | Save a task (tech debt, follow-up, todo) with priority and status |
| `save_meeting` | Save meeting notes — auto-extracts decisions and action items into separate linked files |
| `save_note` | Quick capture — auto-classifies as decision/task/meeting based on signal words |
| `search_vault` | Search vault by content and frontmatter, optionally filtered by type |
| `get_pending_tasks` | Get open/blocked/in-progress tasks, sorted by priority |
| `get_vault_context` | Cross-vault search — finds all mentions of a topic across every content type |
| `update_index` | Rebuild `vault/index.md` from current vault state |

Key behaviors:
- **Auto-classification** — dump raw text, the server figures out if it's a decision, task, or meeting
- **Auto-linking** — every save scans for known people/projects and injects Obsidian `[[wikilinks]]`
- **Auto-stubs** — mentions of new people or projects auto-create stub files
- **Meeting extraction** — `save_meeting` pulls out decisions and action items into separate cross-linked files
- **Voice preservation** — content is structured, never rewritten

## Prerequisites

- Node.js 20+
- [Claude Code](https://claude.ai/code) or [Cursor](https://cursor.com)
- [Obsidian](https://obsidian.md) (optional but recommended — gives you graph view, backlinks, and search over your vault)

## Quick Start

```bash
# 1. Clone
git clone https://github.com/creative-mati/CF-Second-Brain.git
cd CF-Second-Brain

# 2. Install and build
npm install
npm run build

# 3. Configure your editor (see sections below)

# 4. Open vault/ as an Obsidian vault (optional)
```

---

## Setup: Claude Code

### Option A: Global (all projects)

Add to your `~/.claude/settings.json`:

```jsonc
{
  "mcpServers": {
    "second-brain": {
      "command": "node",
      "args": ["/absolute/path/to/CF-Second-Brain/dist/server.js"]
    }
  }
}
```

Replace `/absolute/path/to/CF-Second-Brain` with the actual path where you cloned the repo.

### Option B: Per-project

Add to `.mcp.json` in your project root:

```jsonc
{
  "mcpServers": {
    "second-brain": {
      "command": "node",
      "args": ["/absolute/path/to/CF-Second-Brain/dist/server.js"]
    }
  }
}
```

### Adding the AI Skill (recommended)

The skill teaches Claude how to use the second brain tools automatically. Copy it into your Claude skills directory:

```bash
mkdir -p ~/.claude/skills/second-brain
cp skill/SKILL.md ~/.claude/skills/second-brain/SKILL.md
```

With the skill installed, you can use the natural `sb` prefix:

```
sb went with PostgreSQL over DynamoDB for the user store
sb what did we decide about caching?
sb what's pending?
```

Without the skill, you can still use the tools directly — Claude will see them as MCP tools — but the `sb` shorthand and auto-classification won't work as smoothly.

After configuring, restart Claude Code. Run any conversation and check that the tools appear:

```
You: sb what's pending?
AI:  No matching tasks found.    <-- this means it's working
```

---

## Setup: Cursor

### Option A: Global

Open **Cursor Settings > MCP** and add a new server:

- **Name**: `second-brain`
- **Type**: `command`
- **Command**: `node /absolute/path/to/CF-Second-Brain/dist/server.js`

### Option B: Per-project

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "second-brain": {
      "command": "node",
      "args": ["/absolute/path/to/CF-Second-Brain/dist/server.js"]
    }
  }
}
```

### Adding Cursor Rules (recommended)

For Cursor to use the tools naturally with the `sb` prefix, add a rule file:

```bash
mkdir -p .cursor/rules
cp skill/SKILL.md .cursor/rules/second-brain.mdc
```

Or copy the content of `skill/SKILL.md` into your project's `.cursorrules` file.

---

## Setup: Obsidian

The `vault/` directory is a ready-to-use Obsidian vault.

1. Open Obsidian
2. Click **Open folder as vault**
3. Select the `vault/` directory inside your cloned repo
4. Done — Obsidian will index all files and show the graph

### Recommended plugins

These are optional but make the vault more useful:

- **Dataview** — query tasks by status/priority as tables
- **Calendar** — visual timeline of meetings and decisions
- **Graph Analysis** — enhanced graph view for spotting connections

### What you'll see in Obsidian

- **Graph view** — visual map of how decisions, people, and projects connect
- **Backlinks** — click any person/project and see every decision, task, and meeting they appear in
- **Search** — full-text search across all your knowledge
- **Daily/weekly patterns** — see what was captured over time

---

## Usage

### The `sb` prefix

Prefix any message with `sb` to interact with your vault:

```
sb met with carlos about the API redesign. decided to use REST over GraphQL.
   carlos will write the migration plan by wednesday.
```

This creates:
- A meeting note
- A decision file (REST over GraphQL)
- A task file (migration plan, due Wednesday, waiting on Carlos)
- People/project stubs as needed
- All cross-linked with `[[wikilinks]]`

### Saving

| Pattern | What happens |
|---------|-------------|
| `sb decided/chose/went with...` | Saves as a **decision** |
| `sb need to/should/follow up...` | Saves as a **task** |
| `sb met with/standup/sync...` | Saves as a **meeting** (auto-extracts decisions + tasks) |
| `sb <anything else>` | Auto-classifies based on signal words |

### Querying

| Pattern | What happens |
|---------|-------------|
| `sb what did we decide about X?` | Searches decisions for X |
| `sb what's pending?` | Lists open/blocked tasks |
| `sb what's blocked?` | Lists blocked tasks only |
| `sb what do I know about X?` | Cross-vault search for topic X |
| `sb reindex` | Rebuilds vault/index.md |

---

## Vault Structure

```
vault/
├── decisions/    # Technical/process choices (YYYY-MM-DD-slug.md)
├── tasks/        # Work items, tech debt, follow-ups (YYYY-MM-DD-slug.md)
├── meetings/     # Meeting notes (YYYY-MM-DD-meeting-slug.md)
├── people/       # Auto-created person stubs (firstname-lastname.md)
├── projects/     # Auto-created project stubs (project-name.md)
├── weekly/       # Weekly review summaries (YYYY-WXX.md)
├── .obsidian/    # Obsidian configuration
└── index.md      # Auto-generated index with stats and navigation
```

All entries use YAML frontmatter and Obsidian `[[wikilinks]]`. See `CLAUDE.md` for the full schema.

### Vault content is gitignored

Your vault content (the `.md` files inside `decisions/`, `tasks/`, etc.) is **never committed to git**. The repo only contains the empty directory structure. Your knowledge stays local.

---

## Configuration

### Custom vault path

By default, the vault lives at `<repo-root>/vault/`. To use a different location, set the `VAULT_PATH` environment variable in your MCP config:

```jsonc
{
  "mcpServers": {
    "second-brain": {
      "command": "node",
      "args": ["/path/to/CF-Second-Brain/dist/server.js"],
      "env": {
        "VAULT_PATH": "/path/to/my/obsidian/vault"
      }
    }
  }
}
```

This is useful if you want your vault in a synced folder (iCloud, Dropbox) or shared across machines.

### Claude Code skills

The repo includes additional skills in `.claude/skills/` that enhance how Claude processes your vault content:

| Skill | Purpose |
|-------|---------|
| `capture-processing.md` | Detailed pipeline for processing raw input into structured entries |
| `obsidian-markdown.md` | Obsidian-flavored markdown formatting rules |
| `query-review.md` | Search, review, and reporting procedures |

These are automatically loaded when you use the repo as a Claude Code project. For global use, copy them to `~/.claude/skills/second-brain/`.

---

## How it works

The server is a standard [MCP](https://modelcontextprotocol.io/) server using stdio transport. When your AI assistant calls a tool:

1. **Classify** — signal words determine the content type (decision/task/meeting)
2. **Extract entities** — people names, @mentions, project names are pulled from the text
3. **Create stubs** — new people/projects get stub files in `people/` and `projects/`
4. **Write entry** — the main file is created with YAML frontmatter and structured markdown
5. **Inject wikilinks** — known entities in the text are wrapped in `[[wikilinks]]`
6. **Rebuild index** — `vault/index.md` is regenerated with updated stats

No external services, no API keys, no cloud. Everything runs locally and writes to plain markdown files.

---

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript to dist/
npm start            # Run the MCP server (stdio transport)
```

### Project structure

```
src/
├── server.ts              # MCP server definition, tool registration
├── tools/
│   ├── save-decision.ts   # Decision creation with entity linking
│   ├── save-task.ts       # Task creation with priority/status
│   ├── save-meeting.ts    # Meeting notes with decision/task extraction
│   ├── save-note.ts       # Auto-classification router
│   ├── search-vault.ts    # Full-text search across vault
│   ├── get-pending-tasks.ts  # Filtered task listing
│   ├── get-vault-context.ts  # Cross-vault topic synthesis
│   └── update-index.ts    # Index rebuilder
└── utils/
    ├── paths.ts           # Directory constants, VAULT_PATH env var
    ├── vault.ts           # File I/O, wikilink injection, search
    ├── classifier.ts      # Signal-word content classification
    ├── entities.ts        # Entity extraction and stub creation
    ├── frontmatter.ts     # YAML frontmatter parser/serializer
    ├── index-updater.ts   # Rebuilds vault/index.md
    └── slug.ts            # Slugification and date formatting
```

---

## License

[Apache-2.0](LICENSE)
