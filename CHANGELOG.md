# Changelog

## [2.0.0] — 2026-04-15

### Skill Rewrite — Karpathy Compression

Rewrote the skill from 6 files (~700 lines) to 1 file (~217 lines) following Karpathy's "compress ruthlessly, trust the model, measure everything" approach.

#### Removed

- `skills/capture-processing.md` — described server-side extraction pipeline Claude doesn't control
- `skills/obsidian-markdown.md` — Claude already knows wikilinks, YAML frontmatter, and callouts
- `skills/query-review.md` — procedures handled by the MCP server, not the client
- `skills/vault-schema.md` — merged into SKILL.md as a compact 7-row table
- `skills/second-brain.mdc` — Cursor-format duplicate of SKILL.md
- `skills/second-brain.bak/` — identical backup, dead artifact

#### Changed

- `skills/SKILL.md` — v2.0, single source of truth
  - Simplified classification: 4-line type descriptions replace 30+ signal word lists
  - Added `Learning` content type for knowledge capture (new tech, articles, talks)
  - Added `sb stats` with JSON persistence and delta reporting
  - Added session hooks: staleness check on first `sb`, auto-reindex after 3+ writes
  - Added work integration: passive vault search when starting Jira tickets
  - Added "show inferred metadata" rule for catching misclassifications

#### Added

- `vault/stats/dashboard.html` — self-contained Chart.js dashboard
  - Distribution over time (line chart)
  - Task health over time (stacked bar)
  - Type ratio (doughnut)
  - Growth rate (bar chart)
  - Snapshot comparison table
  - Recent entries table
  - Collapsible "How to read this dashboard" guide
- `vault/stats/history.json` — append-only snapshot history (gitignored, user-specific)
- `vault/GUIDE.md` — practical usage guide covering what to capture, when, and how to measure success

## [1.0.0] — 2026-04-13

### Initial Release

- Skill with 6 files: SKILL.md, capture-processing.md, obsidian-markdown.md, query-review.md, vault-schema.md, second-brain.mdc
- MCP tools: save_decision, save_task, save_meeting, save_note, search_vault, get_pending_tasks, get_vault_context, update_index
- Auto-classification with signal word lists
- Obsidian wikilink formatting rules
- Vault schema with frontmatter templates
