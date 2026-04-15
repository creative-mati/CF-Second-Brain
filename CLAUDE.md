# CF Second Brain — Development Guide

MCP server that reads/writes an Obsidian vault. This file is for developing the server itself.

For user-facing documentation (vault schema, processing rules, tool usage), see `skills/`.

## Architecture

```
src/
├── server.ts           # MCP server setup, tool registration (Zod schemas)
├── tools/              # One file per MCP tool — each exports a pure function
└── utils/
    ├── paths.ts        # VAULT_ROOT resolution (env var or relative default)
    ├── vault.ts        # File I/O, wikilink injection, search helpers
    ├── classifier.ts   # Signal-word scoring for auto-classification
    ├── entities.ts     # Entity extraction → people/project stub creation
    ├── frontmatter.ts  # Custom YAML parser/serializer (no dependencies)
    └── slug.ts         # Slugification and date formatting
```

### Key design decisions

- **No external YAML library** — `frontmatter.ts` handles the subset we use (scalars, inline arrays, quoted strings). Keeps dependencies minimal.
- **Sync I/O** — all vault reads/writes are synchronous (`fs.readFileSync`/`fs.writeFileSync`). MCP tools are called sequentially and the vault is local disk, so async adds complexity without benefit.
- **Index rebuilt on every write** — `rebuildIndex()` runs after every save operation. This keeps `vault/index.md` always current at the cost of O(n) directory scans per write. Fine for vaults under ~1000 files.
- **Wikilink injection is first-occurrence only** — `injectWikilinks()` links the first mention of each entity to avoid noisy text.

## Build and run

```bash
npm install        # Install dependencies
npm run build      # tsc → dist/
npm start          # Run via stdio transport
```

The server uses stdio transport — it's started by the Claude/Cursor harness on demand, not as a long-running process.

## Adding a new tool

1. Create `src/tools/my-tool.ts` exporting a function that returns a JSON string
2. Register it in `src/server.ts` with `server.tool(name, description, zodSchema, handler)`
3. Rebuild: `npm run build`
4. Document the tool in `skills/SKILL.md` (Claude Code) and `skills/second-brain.mdc` (Cursor)

## Vault path

Resolved in `src/utils/paths.ts`:
- `VAULT_PATH` env var → absolute path to any directory
- Default → `../../vault` relative to `dist/utils/` (= `<repo-root>/vault/`)

## Skills

All user-facing docs live in `skills/`:

| File | Purpose |
|------|---------|
| `SKILL.md` | Claude Code main skill — `sb` prefix, auto-classification, tool params |
| `second-brain.mdc` | Cursor equivalent of SKILL.md |
| `vault-schema.md` | Content type definitions, frontmatter templates, behavioral rules |
| `capture-processing.md` | Detailed processing pipeline for raw input |
| `obsidian-markdown.md` | Obsidian markdown formatting rules |
| `query-review.md` | Search, review, and reporting procedures |
