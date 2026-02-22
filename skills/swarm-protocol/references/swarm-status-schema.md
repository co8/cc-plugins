# Swarm Status Schema Reference

## CRITICAL: Keep swarm-status.json Updated

**swarm-status.json is MANDATORY for all swarm projects.** The ScopeTUI Swarm Monitor (`scopetui --swarm`) reads this file to display real-time progress. If the file is stale or missing, the monitor shows incorrect/incomplete status.

**You MUST update swarm-status.json at every state transition:**
- Phase starts → set phase `status: "running"`
- Agent starts → set agent `status: "running"`
- Agent completes → set agent `status: "completed"`
- Phase completes → set phase `status: "completed"`, advance `currentPhaseId`
- Project completes → ALL phases `"completed"`, update `updatedAt`

**Location**: `docs/projects/<project-name>/swarm-status.json` (inside the worktree, NOT master)

---

## Validated Minimal Format

The TUI parser requires only `phases` as an array. All other root fields and all phase sub-fields beyond `id`, `name`, `status`, `agents` are optional. This is the **minimum viable format**:

```json
{
  "project": "my-project",
  "branch": "feature/my-project",
  "phases": [
    {
      "id": "1",
      "name": "Setup",
      "status": "completed",
      "agents": [
        { "id": "1.1", "name": "Types", "status": "completed" }
      ]
    },
    {
      "id": "2",
      "name": "Implementation",
      "status": "running",
      "agents": [
        { "id": "2.1", "name": "Service A", "status": "running" },
        { "id": "2.2", "name": "Service B", "status": "pending" }
      ]
    }
  ]
}
```

## Full Format (Recommended)

Includes all fields for rich TUI display:

```json
{
  "schemaVersion": "1.0",
  "project": "example-feature",
  "branch": "feature/example",
  "startedAt": "2026-02-19T10:00:00Z",
  "currentPhaseId": "2",
  "phases": [
    {
      "id": "1",
      "name": "Setup",
      "status": "completed",
      "dependsOn": [],
      "parallelism": false,
      "agents": [
        {
          "id": "1.1",
          "name": "Types",
          "status": "completed",
          "files": ["src/types/foo.ts"],
          "startedAt": "2026-02-19T10:00:00Z",
          "completedAt": "2026-02-19T10:10:00Z",
          "events": [
            { "type": "files_changed", "timestamp": "2026-02-19T10:08:00Z", "count": 3 },
            { "type": "committed", "timestamp": "2026-02-19T10:10:00Z", "sha": "abc1234", "message": "feat: add base types" }
          ]
        }
      ],
      "rollup": { "total": 1, "completed": 1, "in_progress": 0, "failed": 0, "pending": 0, "skipped": 0, "blocked": 0 },
      "startedAt": "2026-02-19T10:00:00Z",
      "completedAt": "2026-02-19T10:10:00Z"
    }
  ],
  "updatedAt": "2026-02-19T10:20:00Z"
}
```

---

## Field Reference

### Root Object (`SwarmStatus`)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `phases` | **YES** | `SwarmPhase[]` | Array of project phases — the only required field |
| `project` | no | `string` | Project name (displayed in TUI header) |
| `branch` | no | `string` | Git branch name |
| `startedAt` | no | `string` | ISO 8601 timestamp |
| `currentPhaseId` | no | `string` | ID of the active phase (TUI auto-expands this) |
| `updatedAt` | no | `string` | ISO 8601 timestamp of last update |
| `schemaVersion` | no | `"1.0"` | Schema version |

### Phase Object (`SwarmPhase`)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `id` | **YES** | `string` | Unique phase identifier |
| `name` | **YES** | `string` | Display name |
| `status` | **YES** | `SwarmPhaseStatus` | Current status |
| `agents` | **YES** | `SwarmAgent[]` | Agents in this phase (can be `[]`) |
| `dependsOn` | no | `string[]` | Phase IDs this depends on (default: `[]`) |
| `parallelism` | no | `boolean \| "partial"` | Whether agents run in parallel (default: `false`) |
| `rollup` | no | `SwarmPhaseRollup` | Pre-computed counts (TUI derives from agents if missing) |
| `startedAt` | no | `string` | ISO 8601 timestamp |
| `completedAt` | no | `string` | ISO 8601 timestamp |

### Agent Object (`SwarmAgent`)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `id` | **YES** | `string` | Unique agent identifier (e.g., `"2.1"`) |
| `name` | **YES** | `string` | Display name |
| `status` | **YES** | `SwarmAgentStatus` | Current status |
| `files` | no | `string[]` | Files this agent works on (simple tracking) |
| `events` | no | `SwarmAgentEvent[]` | Detailed event timeline |
| `worktree` | no | `string` | Git worktree name |
| `branch` | no | `string` | Git branch name |
| `startedAt` | no | `string` | ISO 8601 timestamp |
| `completedAt` | no | `string` | ISO 8601 timestamp |

### Status Values

| Level | Valid Values | Notes |
|-------|-------------|-------|
| **Phase** | `pending`, `running`, `in_progress`, `completed`, `failed`, `blocked` | `running` and `in_progress` are equivalent |
| **Agent** | `pending`, `running`, `completed`, `failed`, `skipped`, `blocked` | Use `running` (not `in_progress`) |

---

## Update Protocol

### When to Update

| Event | What to Update |
|-------|---------------|
| Project created (Phase 0) | Create `swarm-status.json` with all phases/agents from AGENT_SWARM_SPEC.md, all `pending` |
| Phase starts | Phase `status: "running"`, set `currentPhaseId` |
| Agent dispatched | Agent `status: "running"`, `startedAt` |
| Agent completes | Agent `status: "completed"`, `completedAt` |
| Phase completes | Phase `status: "completed"`, recompute `rollup`, advance `currentPhaseId` |
| Agent fails | Agent `status: "failed"`, add `error` event, set dependents to `blocked` |
| Project completes | ALL phases `"completed"`, update `updatedAt` |
| **Every update** | Update `updatedAt` timestamp |

### Atomic Write

Always write atomically to prevent the TUI from reading partial JSON:

```bash
# Write to temp file first, then atomic rename
Write tool → docs/projects/<name>/.swarm-status.json.tmp
Bash: mv docs/projects/<name>/.swarm-status.json.tmp docs/projects/<name>/swarm-status.json
```

### Rollup Computation (Optional)

If providing `rollup`, recompute after every agent status change:

```typescript
function computeRollup(agents: SwarmAgent[]): SwarmPhaseRollup {
  return {
    total: agents.length,
    completed: agents.filter(a => a.status === 'completed').length,
    in_progress: agents.filter(a => a.status === 'running').length,
    failed: agents.filter(a => a.status === 'failed').length,
    pending: agents.filter(a => a.status === 'pending').length,
    skipped: agents.filter(a => a.status === 'skipped').length,
    blocked: agents.filter(a => a.status === 'blocked').length,
  };
}
```

---

## Event Type Catalog

| Event | Fields | When to Emit |
|-------|--------|--------------|
| `worktree_created` | `path`, `branch` | Agent worktree created |
| `files_changed` | `count` | After agent modifies files |
| `validation_started` | — | Before running typecheck/lint/build |
| `validation_passed` | — | Validation succeeds |
| `validation_failed` | `errorCount`, `detail?` | Validation fails |
| `committed` | `sha`, `message` | Git commit created |
| `merged` | `into` | Branch merged into target |
| `findings_reported` | `critical`, `high`, `medium`, `low` | Code review findings |
| `tests_completed` | `passed`, `failed`, `skipped`, `coverage?` | Test suite finishes |
| `error` | `summary` | Agent encounters error |
| `retrying` | `attempt` | Agent retrying after failure |
| `blocked` | `reason` | Agent cannot proceed |

---

## Checklist

- [ ] Create `swarm-status.json` during Phase 0 — **do not skip this**
- [ ] Update status at EVERY state transition (not just at end)
- [ ] Keep `currentPhaseId` pointing to the active phase
- [ ] Update `updatedAt` on every write
- [ ] When project completes, set ALL phases to `"completed"`
- [ ] File lives in the **worktree** (`docs/projects/<name>/swarm-status.json`), not master
- [ ] Use atomic write (tmp + mv) to prevent partial reads
