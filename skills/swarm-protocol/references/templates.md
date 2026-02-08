# Document Templates

## PROJECT_PLAN.md

```markdown
# Project: <project-name>

## Overview

[Problem statement and proposed solution in 2-3 sentences]

## Goals

- [ ] Primary goal
- [ ] Secondary goal 1
- [ ] Secondary goal 2

## Success Criteria

- [ ] Measurable outcome 1
- [ ] Measurable outcome 2
- [ ] Performance/quality metric

## Dependencies

### Existing Infrastructure
- [Service/component this depends on]

### External Services
- [Third-party APIs or services]

### Team Dependencies
- [Other teams or stakeholders]

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [Strategy] |

## Timeline

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Planning Complete | | ⏳ |
| Phase 1 Complete | | ⏳ |
| Code Review | | ⏳ |
| Review Repair | | ⏳ |
| Final Verification | | ⏳ |

## Stakeholders

- **Owner**: [Name]
- **Reviewers**: [Names]
- **Consumers**: [Teams/users affected]
```

---

## IMPLEMENTATION_PLAN.md

```markdown
# Implementation Plan: <project-name>

## Architecture

[System design description - 2-3 paragraphs explaining the high-level approach]

```
[ASCII diagram or mermaid reference]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/path/file.ts` | Create | [Purpose] |
| `src/path/existing.ts` | Modify | [Changes] |
| `src/path/old.ts` | Delete | [Reason] |

## Database Migrations

### Migration: `YYYYMMDDHHmmss_<description>.sql`

```sql
-- Up
[Migration SQL]

-- Down (rollback)
[Rollback SQL]
```

### Rollback Strategy

[How to safely rollback if issues arise]

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/resource` | GET | Required | [Purpose] |
| `/api/v1/resource` | POST | Required | [Purpose] |

## Type Definitions

```typescript
// Key types that agents will implement
interface NewType {
  // ...
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEW_VAR` | Yes | [Purpose] |

## Phases

See `AGENT_SWARM_SPEC.md` for detailed phase breakdown.
```

---

## AGENT_SWARM_SPEC.md

```markdown
# Agent Swarm Specification: <project-name>

## Phase Overview

| Phase | Name | Agents | Parallel | Dependencies |
|-------|------|--------|----------|--------------|
| 1 | Foundation | 2 | No | None |
| 2 | Core | 4 | Yes | Phase 1 |
| 3 | Integration | 2 | Partial | Phase 2.1, 2.2 |
| 4 | Hardening | 2 | No | Phase 3 |

---

[Agent definitions go here - see `references/agent-patterns.md` for patterns]

Each agent definition uses this format:

### Agent X.Y: <Name>

**Role**: [Single sentence describing responsibility]

**Files**:
- `path/to/file1.ts`
- `path/to/file2.ts`

**Deliverables**:
- [ ] Deliverable 1
- [ ] Deliverable 2

**Validation**:
\`\`\`bash
<command to verify completion>
\`\`\`

**Depends on**: [Agent X.Z] (or "None")
```

**Pattern selection**: Choose from `references/agent-patterns.md`:
- Full-Stack Feature (10 agents) - CRUD, dashboards
- Full-Stack + Supabase (12 agents) - With DB deployment
- API-Only (7 agents) - Backend services
- UI Refactor (10 agents) - Frontend overhauls
- Data Migration (10 agents) - Schema changes
- Integration (10 agents) - Third-party services
- Microservice (13 agents) - New standalone services

---

## CODE_REVIEW.md

```markdown
# Code Review: <project-name>

## Summary

| Metric | Value |
|--------|-------|
| Files Changed | X |
| Lines Added | +Y |
| Lines Removed | -Z |
| Agents Executed | N |
| Phases Completed | M |

## Quality Metrics

| Category | Score | Notes |
|----------|-------|-------|
| Type Safety | A/B/C | [Details] |
| Test Coverage | X% | [Target: 80%] |
| Security | A/B/C | [Auth, validation] |
| Performance | A/B/C | [Query efficiency] |
| Code Style | A/B/C | [Lint compliance] |

## Issues Found

| Severity | Issue | Status | Resolution |
|----------|-------|--------|------------|
| High | [Issue] | ✅ Fixed / ⏳ Pending | [How resolved] |
| Medium | [Issue] | ✅ Fixed / ⏳ Pending | [How resolved] |
| Low | [Issue] | ✅ Fixed / ⏳ Pending | [How resolved] |

## Optimizations Applied

1. **[Optimization 1]**: [Description of improvement]
2. **[Optimization 2]**: [Description of improvement]

## Security Review

- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection
- [ ] Rate limiting configured
- [ ] Sensitive data handling

## Suggestions & Nits

| Type | Description | Status |
|------|-------------|--------|
| Suggestion | [Code improvement suggestion] | ✅ Applied / ⏳ Pending |
| Nit | [Minor style or formatting issue] | ✅ Applied / ⏳ Pending |

## Enhancements

| Enhancement | Description | Status |
|-------------|-------------|--------|
| [Enhancement 1] | [Better types, edge cases, UX improvements] | ✅ Applied / ⏳ Pending |

## Recommendations

### Immediate (Before Merge)
- [Critical items]

### Short-term (Next Sprint)
- [Important improvements]

### Long-term (Technical Debt)
- [Future considerations]

## Approval

- [ ] Code review complete
- [ ] All issues resolved (Review Repair)
- [ ] Tests passing (Verify)
- [ ] Documentation updated
- [ ] Ready for merge
```

---

## CHANGELOG.md

```markdown
# Changelog: <project-name>

## Execution Log

### Phase 0: Setup
- [x] Project structure created
- [x] Feature branch: `feature/<project-name>`
- [x] Worktree: `../studioFE-<project-name>`
- [x] Supabase preview: `<project-name>` (if applicable)

---

### Phase 1: Foundation
Started: YYYY-MM-DD HH:MM

- [x] Agent 1.1: Database Schema (commit: `abc1234`)
  - Created migration for X tables
  - Duration: Xm
- [x] Agent 1.2: Type Definitions (commit: `def5678`)
  - Generated X types
  - Duration: Xm

**Phase 1 Complete**: 2 agents, 0 errors, Xm total

---

### Phase 2: Core Implementation
Started: YYYY-MM-DD HH:MM

- [x] Agent 2.1: API Routes (commit: `ghi9012`)
- [x] Agent 2.2: Service Layer (commit: `jkl3456`)
- [ ] Agent 2.3: UI Components (in progress...)
- [ ] Agent 2.4: State Management (queued)

---

### Phase Review: Code Review
Started: YYYY-MM-DD HH:MM

- [ ] CODE_REVIEW.md generated
  - X issues found (Y high, Z medium, W low)
  - N suggestions/nits documented
  - M enhancements identified

---

### Phase Repair: Review Repair
Started: YYYY-MM-DD HH:MM

- [ ] High-severity issues resolved (X/Y)
- [ ] Medium-severity issues resolved (X/Y)
- [ ] Low-severity issues resolved (X/Y)
- [ ] Recommendations implemented (X/Y)
- [ ] Suggestions & nits applied (X/Y)
- [ ] Enhancements added (X/Y)

---

### Phase Verify: Final Verification
Started: YYYY-MM-DD HH:MM

- [ ] Tests passing
- [ ] Typecheck passing
- [ ] Lint passing
- [ ] No regressions found
- [ ] CODE_REVIEW.md fully resolved
- [ ] Project CLAUDE.md updated

---

### Errors & Recovery

#### Error 1: Agent 2.3 - Type Mismatch
**Time**: YYYY-MM-DD HH:MM
**Error**: `Type 'X' is not assignable to type 'Y'`
**Resolution**: Updated interface in types file
**Action**: Retry successful
```

---

## Progress Display

For ASCII art, progress bars, and ANSI color codes, see `references/progress-art.md`.

**Quick reference**: `●` (green/done), `◐` (yellow/active), `○` (dim gray/pending)
