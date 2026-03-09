# Swarm Status Schema Reference

## CRITICAL: Automatic Progressive Status Updates

**swarm-status.json is MANDATORY for all swarm projects.** The ScopeTUI Swarm Monitor (`scopetui --swarm`) reads this file to display real-time progress. If the file is stale or missing, the monitor shows incorrect/incomplete status.

**The #1 problem is update lag** — status gets stale because updates are forgotten during complex operations. The solution is to **embed status updates into every orchestrator action** so they happen automatically.

**Location**: `docs/projects/<project-name>/swarm-status.json` (inside the worktree, NOT master)

---

## Progressive Update System

### The Rule: Update Status BEFORE and AFTER Every Action

Instead of relying on remembering to update status, **bake it into the orchestration flow**:

```
BEFORE dispatching agent → update status to "running" + write file
AFTER agent returns      → update status to "completed"/"failed" + write file
BEFORE phase transition  → advance currentPhaseId + write file
```

**This means**: Every Agent tool call in the orchestrator must be wrapped with status writes. The orchestrator (main Claude session) owns the status file — subagents never touch it.

### Status Update Helper (Bash one-liner)

Use this helper to atomically update swarm-status.json via `jq`. Embed it in the orchestrator flow.

```bash
# Helper: update agent status atomically
# Usage: swarm_update <status-file> <agent-id> <new-status>
swarm_update() {
  local file="$1" agent_id="$2" new_status="$3" now
  now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  jq --arg aid "$agent_id" --arg st "$new_status" --arg now "$now" '
    (.phases[].agents[] | select(.id == $aid)) |= (
      .status = $st |
      if $st == "running" then .startedAt = $now
      elif $st == "completed" then .completedAt = $now
      else . end
    ) |
    .updatedAt = $now
  ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
}
```

### Orchestrator Flow Pattern

Every phase execution in the orchestrator MUST follow this pattern:

```
1. UPDATE STATUS: phase → "running", all phase agents → "pending"
2. For each agent batch (parallel group):
   a. UPDATE STATUS: agents in batch → "running"
   b. DISPATCH: Launch Agent tool calls (single message, parallel)
   c. UPDATE STATUS: returned agents → "completed" or "failed"
3. UPDATE STATUS: phase → "completed", advance currentPhaseId
4. COMMIT: milestone commit
```

**Concrete example** — Phase 2 with 4 parallel agents:

```
// Step 1: Mark phase as running
Bash: swarm_update status.json "phase-2" "running"  // (or use Write tool)

// Step 2a: Mark all agents as running
Bash: swarm_update status.json "2.1" "running"
Bash: swarm_update status.json "2.2" "running"
Bash: swarm_update status.json "2.3" "running"
Bash: swarm_update status.json "2.4" "running"

// Step 2b: Dispatch all 4 agents in ONE message
Agent(subagent_type="general-purpose", prompt="Agent 2.1: API Routes...")
Agent(subagent_type="general-purpose", prompt="Agent 2.2: Service Layer...")
Agent(subagent_type="general-purpose", prompt="Agent 2.3: UI Components...")
Agent(subagent_type="general-purpose", prompt="Agent 2.4: State Management...")

// Step 2c: As each agent returns, mark completed
Bash: swarm_update status.json "2.1" "completed"
// ... etc for each

// Step 3: Mark phase complete
Bash: swarm_update status.json "phase-2" "completed"
// Advance currentPhaseId to "3"
```

### Background Agent Status Tracking

When using `run_in_background: true`, the orchestrator will be notified when the agent completes. Update status at that notification point:

```
// Dispatch in background
Agent(subagent_type="...", run_in_background=true)
// Status already set to "running" before dispatch

// ... do other work ...

// When notification arrives that background agent completed:
Bash: swarm_update status.json "<agent-id>" "completed"
```

---

## Validated Minimal Format

The TUI parser requires only `phases` as an array. This is the **minimum viable format**:

```json
{
  "project": "my-project",
  "branch": "feature/my-project",
  "currentPhaseId": "2",
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
  ],
  "updatedAt": "2026-03-09T10:00:00Z"
}
```

## Full Format (Recommended)

Includes all fields for rich TUI display:

```json
{
  "schemaVersion": "2.0",
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
          "subagentType": "general-purpose",
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
| `schemaVersion` | no | `"2.0"` | Schema version |

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
| `subagentType` | no | `string` | Claude Code subagent_type used (e.g., `"feature-dev:code-reviewer"`) |
| `agentId` | no | `string` | Claude Agent ID for resume capability |
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

## Update Protocol — Progressive Automation

### The Update Cadence

| Moment | What to Update | Why |
|--------|---------------|-----|
| Phase 0 (project created) | Create `swarm-status.json` with ALL phases/agents, all `pending` | Initialize full structure |
| **BEFORE** dispatching agent | Agent → `"running"`, `startedAt` | TUI shows agent is active |
| **IMMEDIATELY AFTER** agent returns | Agent → `"completed"`/`"failed"`, `completedAt` | TUI reflects result |
| All agents in phase done | Phase → `"completed"`, advance `currentPhaseId` | TUI advances to next phase |
| Agent fails | Agent → `"failed"`, add `error` event, set dependents → `"blocked"` | TUI shows failure |
| Project completes | ALL phases → `"completed"` | TUI shows done |
| **EVERY write** | Update `updatedAt` | TUI freshness indicator |

### Anti-Lag Rules

1. **Never batch status updates** — update immediately at each transition, not at end of phase
2. **Status writes happen in the orchestrator** (main session), never delegated to subagents
3. **Use the jq helper** (above) or Write tool — both support atomic writes
4. **If you forget**: Before ANY Agent tool call, ask yourself "Did I update swarm-status.json?"
5. **Track agent IDs**: Store the `agentId` returned by Agent tool in swarm-status.json for resume capability

### Atomic Write

Always write atomically to prevent the TUI from reading partial JSON:

```bash
# Method 1: jq helper (preferred for single-field updates)
swarm_update docs/projects/<name>/swarm-status.json "2.1" "running"

# Method 2: Write tool + mv (for full rewrites)
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
- [ ] Update status **BEFORE** dispatching each agent (set to `"running"`)
- [ ] Update status **IMMEDIATELY AFTER** each agent returns (set to `"completed"`/`"failed"`)
- [ ] Never batch updates — each transition gets its own write
- [ ] Keep `currentPhaseId` pointing to the active phase
- [ ] Update `updatedAt` on every write
- [ ] Store `agentId` for resume capability
- [ ] When project completes, set ALL phases to `"completed"`
- [ ] File lives in the **worktree** (`docs/projects/<name>/swarm-status.json`), not master
- [ ] Use atomic write (jq helper or tmp + mv) to prevent partial reads
