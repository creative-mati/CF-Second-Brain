# Skill: Vault Schema

The complete schema for all vault content types. Reference this when reading, writing, or validating vault entries.

## Content Types

### Decisions
Technical or process choices with context, rationale, and alternatives considered.
- Directory: `vault/decisions/`
- Naming: `YYYY-MM-DD-short-slug.md`
- Frontmatter:
```yaml
---
type: decision
date: YYYY-MM-DD
status: active  # active | superseded | revisit
domain: []      # backend, frontend, infra, devops, architecture, security, testing, process
participants: []
related_decisions: []
tags: []
---
```

### Tasks
Work not tracked in Jira — tech debt, ideas, waiting-on items, things to follow up on.
- Directory: `vault/tasks/`
- Naming: `YYYY-MM-DD-short-slug.md`
- Frontmatter:
```yaml
---
type: task
date: YYYY-MM-DD
status: open  # open | in-progress | blocked | done | cancelled
priority: p2-medium  # p0-critical | p1-high | p2-medium | p3-low
waiting_on: ""
due: ""
source: ""  # meeting link, slack thread, PR, etc.
tags: []
---
```

### Meeting Notes
Summaries, action items, and takeaways from any meeting.
- Directory: `vault/meetings/`
- Naming: `YYYY-MM-DD-meeting-topic.md`
- Frontmatter:
```yaml
---
type: meeting
date: YYYY-MM-DD
attendees: []
project: ""
tags: []
---
```

### People
Auto-created stubs for anyone mentioned in the vault.
- Directory: `vault/people/`
- Naming: `firstname-lastname.md`
- Frontmatter:
```yaml
---
type: person
role: ""
team: ""
last_mentioned: YYYY-MM-DD
---
```

### Projects
Auto-created stubs for any system, service, or initiative mentioned.
- Directory: `vault/projects/`
- Naming: `project-name.md`
- Frontmatter:
```yaml
---
type: project
status: active
last_updated: YYYY-MM-DD
---
```

### Weekly Reviews
Generated summaries of vault activity per week.
- Directory: `vault/weekly/`
- Naming: `YYYY-WXX.md`

## Behavioral Rules

1. **Low friction above all** — never ask follow-up questions when processing input. Make reasonable assumptions. Get it into the vault NOW.
2. **Always auto-link** — scan existing vault entries and link aggressively. False positives are cheap, missing links are expensive.
3. **Preserve voice** — the user's words matter. Structure them, don't rewrite them.
4. **Date everything** — use today's date unless the user specifies otherwise.
5. **Be opinionated about status:**
   - "we should probably..." -> task (open)
   - "we went with X" -> decision (active)
   - "waiting on..." -> task (blocked)
   - "we need to revisit..." -> decision (revisit)
6. **Surface staleness** — flag anything untouched for 2+ weeks during reviews.
7. **No empty sections** — if a section would be empty, omit it entirely.
8. **Conflict resolution** — if a new decision contradicts an existing one, mark the old one as `superseded` and link to the new one.

## Tags

Domain tags: `#backend`, `#frontend`, `#infra`, `#devops`, `#architecture`, `#security`, `#testing`, `#process`

Status tags: `#active`, `#superseded`, `#revisit`, `#blocked`, `#stale`

Priority tags: `#p0-critical`, `#p1-high`, `#p2-medium`, `#p3-low`
