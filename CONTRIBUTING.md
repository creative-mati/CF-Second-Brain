# Contributing to CF Second Brain

Thanks for your interest in contributing! This guide covers how to add tools, write tests, and submit changes.

## Getting started

```bash
git clone https://github.com/creativefabrica/CF-Second-Brain.git
cd CF-Second-Brain
npm install
npm run build
npm test        # 80 tests, should all pass
```

## Adding a new tool

Each tool lives in its own file under `src/tools/`. Follow this pattern:

### 1. Create the tool file

```
src/tools/my-tool.ts
```

Export a params interface and a function that returns a JSON string:

```ts
import { /* utils you need */ } from "../utils/vault.js";

export interface MyToolParams {
  // ...
}

export function myTool(params: MyToolParams): string {
  // Do work...
  return JSON.stringify({
    message: "Human-readable summary",
    // other fields...
  });
}
```

Conventions:
- Return `JSON.stringify(...)` — the server wraps it in MCP content
- Include a `message` field in the response for the AI to read
- For errors, return `{ error: true, message: "..." }` instead of throwing
- Call `rebuildIndex()` after any write operation
- Use `injectWikilinks()` on body text before writing

### 2. Register in server.ts

```ts
import { myTool } from "./tools/my-tool.js";

server.tool(
  "my_tool",
  "Description for the AI to understand when to use this tool.",
  {
    param: z.string().describe("What this param is for"),
  },
  async (params) => {
    const result = myTool(params);
    return { content: [{ type: "text", text: result }] };
  }
);
```

Tool names use `snake_case`. Descriptions should tell the AI **when** to use the tool, not just what it does.

### 3. Add tests

Create `src/utils/my-util.test.ts` or `src/tools/my-tool.test.ts` next to the source file.

```ts
import { describe, it, expect } from "vitest";
import { myTool } from "./my-tool.js";

describe("myTool", () => {
  it("does the thing", () => {
    const result = JSON.parse(myTool({ /* params */ }));
    expect(result.message).toContain("expected");
  });
});
```

Testing rules:
- **Co-locate** tests with source files (`*.test.ts`)
- **No mocks** — test against the real vault when filesystem is needed
- **Clean up** — if your test creates vault files, delete them in `afterEach`
- **Run the suite** before submitting: `npm test`

### 4. Update the skills

If your tool should be discoverable via the `sb` prefix:
- Add it to `skills/SKILL.md` (Claude Code)
- Add it to `skills/second-brain.mdc` (Cursor)

## Utilities

Available helpers in `src/utils/`:

| File | What it provides |
|------|-----------------|
| `vault.ts` | `readEntry`, `writeEntry`, `listByType`, `findEntry`, `injectWikilinks`, `buildEntryPath` |
| `paths.ts` | `DIRS`, `VAULT_ROOT`, `dirForType` |
| `frontmatter.ts` | `parseFrontmatter`, `serializeFrontmatter` |
| `slug.ts` | `slugify`, `today` |
| `entities.ts` | `extractAndEnsureEntities` |
| `index-updater.ts` | `rebuildIndex` |
| `classifier.ts` | `classify`, `extractTitle` |

## Pull requests

1. Create a branch from `main`
2. Make your changes
3. Run `npm run build` — must compile with no errors
4. Run `npm test` — all tests must pass
5. Open a PR with a clear description of what the tool does and why

Keep PRs focused — one tool per PR when possible.

## Code style

- TypeScript strict mode
- ES modules (`import`/`export`, `.js` extensions in imports)
- No external runtime dependencies beyond `@modelcontextprotocol/sdk`
- Minimal abstractions — each tool is a straightforward function
