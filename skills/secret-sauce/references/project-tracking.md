# Project Tracking Reference

A guide for tracking project status in CLAUDE.md files using consistent patterns.

---

## Status Indicators

Use consistent text status markers:

| Marker | Status | Description |
|--------|--------|-------------|
| `[HOT]` | Active | Currently being worked on |
| `[WIP]` | In Progress | Development underway |
| `[DONE]` | Complete | Finished and merged |
| `[PLAN]` | Planning | Spec or research phase |
| `[HOLD]` | Paused | Temporarily on hold |
| `[STOP]` | Cancelled | Abandoned or superseded |

### Status Format

```markdown
### [HOT] Project Name

**Status**: In Progress
```

---

## Active Projects Section

Projects currently in development:

```markdown
## Active Projects

### [HOT] Project Phoenix - Security Infrastructure

**Status**: [DONE] Operational
**Branch**: `feature/project-phoenix` (merged)
**Documentation**: [docs/projects/project-phoenix/](./docs/projects/project-phoenix/)

Brief description of the project's purpose and current state.

**Infrastructure**:
- **Database**: `table_name` with X columns, Y indexes
- **API**: `GET /api/resource` - Description
- **Tests**: 286 tests across API, components, integration

**Key Files**:
- Service: `src/services/project-service.ts`
- API: `src/app/api/project/route.ts`
- Component: `src/components/ProjectCard.tsx`
- Tests: `src/tests/project/`

**Note**: Any important operational notes or caveats.

---

### [WIP] Project Quarry - GPU Integration

**Status**: [WIP] In Progress
**Branch**: `feature/quarry-integration`
**Location**: `src/services/quarry/`
**Documentation**: [docs/projects/quarry/](./docs/projects/quarry/)

Description with key features:

- **Feature 1**: Description of capability
- **Feature 2**: Description of capability
- **Feature 3**: Description of capability

**Key Files**:
- Service: `src/services/quarry/quarry-service.ts`
- Repository: `src/services/quarry/quarry-repository.ts`
- Types: `src/types/quarry.ts`
- API: `src/app/api/quarry/`
- Tests: `src/tests/quarry/`
```

---

## Pending Projects Section

Projects in planning or research phase:

```markdown
## Pending Projects

### [PLAN] BigQuery Integration (Project Scale)

**Status**: [PLAN] Research Complete
**Documentation**: [docs/research/BIGQUERY_REPORT.md](./docs/research/BIGQUERY_REPORT.md)

Description of the planned project:

- **Current**: How things work now
- **Phase 1 (Now-10K)**: First milestone
- **Phase 2 (10K-100K)**: Second milestone
- **Phase 3 (100K+)**: Final state

**Key Decision**: Important architectural decisions made.

---

### [PLAN] WebGPU Visualization (Project Render)

**Status**: [PLAN] Research Complete
**Documentation**: [docs/projects/webgpu/](./docs/projects/webgpu/)

Description of the proposed project:

- **Current Stack**: What exists now
- **Benefits**: Why change
- **Trigger**: When to implement
```

---

## Completed Projects Section

Use a summary format for completed work:

```markdown
## Completed Projects

**Full Documentation**: [docs/projects/completed/](./docs/projects/completed/)

All completed projects have been moved to the completed directory. See [Completed Projects Index](./docs/projects/completed/README.md) for details.

### Recently Completed (Jan 2026)

#### [DONE] Cerberus - COMPLETE 20260122

**Status**: [DONE] Complete (Jan 2026)
**Location**: `docker/cerberus/`

Brief description of what was accomplished.

#### [DONE] Database Backup System - COMPLETE 20260122

**Status**: [DONE] Complete (Jan 2026)
**Branch**: `feature/database-backup`
**Documentation**: [docs/projects/completed/fortress/](./docs/projects/completed/fortress/)

Brief description of the completed project.

### All Completed Projects (27 Total)

For detailed information, see [docs/projects/completed/README.md](./docs/projects/completed/README.md)

- **[Anacaona](./docs/projects/completed/anacaona/)** - Security monitoring
- **[Bender](./docs/projects/completed/bender/)** - User authentication
- **[Cerberus](./docs/projects/completed/cerberus/)** - Worker containerization
- **[Euro](./docs/projects/completed/euro/)** - Internationalization
```

---

## Project Metadata Format

Each project should include standardized metadata:

```markdown
### Project Name

**Status**: [emoji] State Description
**Branch**: `feature/branch-name`
**Location**: `src/services/project/`
**Worktree**: `../repo-worktree` (if applicable)
**Documentation**: [docs/projects/name/](./docs/projects/name/)
```

### Metadata Fields

| Field | Required | Description |
|-------|----------|-------------|
| `Status` | Yes | Current state with emoji |
| `Branch` | Yes | Git branch name |
| `Location` | No | Primary code location |
| `Worktree` | No | Separate worktree path |
| `Documentation` | Yes | Docs directory link |

---

## Key Files List Format

List important files for each project:

```markdown
**Key Files**:
- Service: `src/services/project-service.ts`
- Repository: `src/services/project-repository.ts`
- Types: `src/types/project.ts`
- API: `src/app/api/project/`
- Worker: `src/workers/project-worker.ts`
- Component: `src/components/project/ProjectCard.tsx`
- Tests: `src/tests/project/`
- Code Review: `docs/projects/name/CODE_REVIEW.md`
```

### File Categories

Organize by function:

| Category | Pattern | Example |
|----------|---------|---------|
| Service | Core logic | `src/services/name-service.ts` |
| Repository | Data access | `src/services/name-repository.ts` |
| Types | Definitions | `src/types/name.ts` |
| API | Endpoints | `src/app/api/name/route.ts` |
| Worker | Background | `src/workers/name-worker.ts` |
| Component | UI | `src/components/name/Card.tsx` |
| Tests | Test files | `src/tests/name/` |

---

## Timeline/Milestone Tracking

For ongoing projects, track milestones:

```markdown
### Timeline

| Date | Milestone | Status |
|------|-----------|--------|
| 2026-01-15 | Research complete | [DONE] |
| 2026-01-20 | Schema design | [DONE] |
| 2026-01-25 | API implementation | [WIP] |
| 2026-01-30 | UI components | [PLAN] |
| 2026-02-05 | Testing & QA | [PLAN] |
| 2026-02-10 | Production deploy | [PLAN] |
```

### Milestone Statuses

- `[DONE]` Complete
- `[WIP]` In Progress
- `[PLAN]` Planned
- `[RISK]` At Risk
- `[BLOCK]` Blocked

---

## Completion Date Format

Use ISO date format with project suffix:

```markdown
**Status**: [DONE] Complete (Jan 2026)

## Or with specific date:

**Status**: [DONE] COMPLETE 20260122
```

### Date Formats

| Format | Use Case | Example |
|--------|----------|---------|
| `YYYYMMDD` | Completion suffix | `COMPLETE 20260122` |
| `MMM YYYY` | Display text | `Complete (Jan 2026)` |
| `YYYY-MM-DD` | Milestone dates | `2026-01-26` |

---

## Project Notes Pattern

Add operational notes when needed:

```markdown
**Note**: "Offline" badge in dashboard indicates no active SSE stream (no scan running) - this is expected behavior, not an error.

**Remaining**: Test coverage (>90% target)

**Key Decision**: pgvector for real-time search, BigQuery for batch analytics.
```

---

## Complete Example

```markdown
## Active Projects

### [HOT] Project Phoenix - ZAP Security Infrastructure

**Status**: [DONE] Operational
**Branch**: `feature/zap-phoenix` (merged)
**Documentation**: [docs/projects/zap-phoenix/](./docs/projects/zap-phoenix/)

Full OWASP ZAP security scanning infrastructure with real-time monitoring.

**Infrastructure**:
- **Database**: `security_scan_history` - 10 columns, 11 indexes
- **Health**: `GET /api/monitor/security/health`
- **Scan API**: `POST /api/monitor/security/scan`
- **Tests**: 286 tests

**Key Files**:
- Worker: `src/workers/security-scan-worker.ts`
- Health: `src/app/api/monitor/security/health/route.ts`
- Dashboard: `src/components/monitor/SecurityMonitoringCard.tsx`

**Note**: "Offline" badge indicates no active scan - expected behavior.

---

## Pending Projects

### [PLAN] BigQuery Integration (Project Scale)

**Status**: [PLAN] Research Complete
**Documentation**: [docs/research/BIGQUERY_REPORT.md](./docs/research/BIGQUERY_REPORT.md)

Hybrid architecture for scaling vector search to 1M+ records.

- **Phase 1**: pgvector (current, sufficient to 10K)
- **Phase 2**: Add pgvectorscale (10K-100K)
- **Phase 3**: Hybrid BigQuery architecture (100K+)

---

## Completed Projects

**Full Documentation**: [docs/projects/completed/](./docs/projects/completed/)

### Recently Completed (Jan 2026)

#### [DONE] Cerberus - COMPLETE 20260122

**Status**: [DONE] Complete (Jan 2026)
**Location**: `docker/cerberus/`

Railway worker containerization with npm ci configuration.

### All Completed Projects (15 Total)

- **[Anacaona](./docs/projects/completed/anacaona/)** - Security monitoring
- **[Bender](./docs/projects/completed/bender/)** - Authentication
- **[Cerberus](./docs/projects/completed/cerberus/)** - Containerization
```

---

## Best Practices

1. **Consistent badges**: Always use the same emoji for the same status
2. **Regular updates**: Update status when projects change phase
3. **Archive completed**: Move finished projects to completed section
4. **Link documentation**: Always link to detailed project docs
5. **Include key files**: Help Claude navigate the codebase
6. **Note caveats**: Document non-obvious behavior
7. **Date completion**: Always include completion dates
8. **Summarize completed**: Keep completed section concise
