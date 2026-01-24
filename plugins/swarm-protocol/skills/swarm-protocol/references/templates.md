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
| Final Review | | ⏳ |

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

## Phase 1: Foundation (Sequential)

### Agent 1.1: Database Schema

**Role**: Create database schema and migrations

**Files**:
- `supabase/migrations/YYYYMMDDHHmmss_<n>.sql`

**Deliverables**:
- [ ] Migration file created
- [ ] Types match schema
- [ ] Rollback tested locally

**Validation**:
```bash
supabase db reset
supabase gen types typescript --local
```

---

### Agent 1.2: Type Definitions

**Role**: Generate TypeScript types from schema

**Files**:
- `src/types/<feature>.types.ts`
- `src/lib/database.types.ts` (update)

**Deliverables**:
- [ ] All entity types defined
- [ ] API request/response types
- [ ] Zod schemas for validation

**Validation**:
```bash
npm run typecheck
```

**Depends on**: Agent 1.1

---

## Phase 2: Core Implementation (Parallel)

### Agent 2.1: API Routes

**Role**: Implement REST API endpoints

**Files**:
- `src/app/api/<feature>/route.ts`
- `src/app/api/<feature>/[id]/route.ts`

**Deliverables**:
- [ ] CRUD endpoints implemented
- [ ] Input validation
- [ ] Error handling
- [ ] Auth middleware

**Validation**:
```bash
npm run test -- api/<feature>
```

---

### Agent 2.2: Service Layer

**Role**: Business logic and data access

**Files**:
- `src/services/<feature>.service.ts`
- `src/lib/supabase/<feature>.ts`

**Deliverables**:
- [ ] Service class/functions
- [ ] Supabase queries
- [ ] Error types

**Validation**:
```bash
npm run test -- services/<feature>
```

---

### Agent 2.3: UI Components

**Role**: React components for feature

**Files**:
- `src/components/<feature>/`
- `src/hooks/use<Feature>.ts`

**Deliverables**:
- [ ] List component
- [ ] Form component
- [ ] Detail view
- [ ] Custom hooks

**Validation**:
```bash
npm run lint
npm run typecheck
```

---

### Agent 2.4: State Management

**Role**: Client-side state and caching

**Files**:
- `src/stores/<feature>.store.ts`
- `src/queries/<feature>.queries.ts`

**Deliverables**:
- [ ] Zustand/Jotai store (if needed)
- [ ] React Query hooks
- [ ] Optimistic updates

**Validation**:
```bash
npm run typecheck
```

---

## Phase 3: Integration (Partial Parallel)

### Agent 3.1: Page Integration

**Role**: Wire components into pages

**Files**:
- `src/app/(dashboard)/<feature>/page.tsx`
- `src/app/(dashboard)/<feature>/[id]/page.tsx`

**Deliverables**:
- [ ] Page routes created
- [ ] Components integrated
- [ ] Loading/error states

**Depends on**: Agents 2.1, 2.2, 2.3, 2.4

---

### Agent 3.2: Navigation & Layout

**Role**: Add feature to navigation

**Files**:
- `src/components/layout/sidebar.tsx` (update)
- `src/lib/navigation.ts` (update)

**Deliverables**:
- [ ] Sidebar links added
- [ ] Breadcrumbs configured
- [ ] Access control applied

**Depends on**: Agent 3.1

---

## Phase 4: Hardening (Sequential)

### Agent 4.1: Testing

**Role**: Comprehensive test coverage

**Files**:
- `src/__tests__/<feature>/`
- `e2e/<feature>.spec.ts`

**Deliverables**:
- [ ] Unit tests (>80% coverage)
- [ ] Integration tests
- [ ] E2E happy path

**Validation**:
```bash
npm run test -- --coverage
npm run test:e2e
```

---

### Agent 4.2: Documentation

**Role**: Update documentation

**Files**:
- `docs/api/<feature>.md`
- `README.md` (update if needed)
- `CHANGELOG.md`

**Deliverables**:
- [ ] API documentation
- [ ] Usage examples
- [ ] Changelog entry

**Depends on**: Agent 4.1
```

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

| Severity | Issue | Resolution |
|----------|-------|------------|
| High | [Issue] | [How resolved] |
| Medium | [Issue] | [How resolved] |
| Low | [Issue] | [How resolved] |

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

## Recommendations

### Immediate (Before Merge)
- [Critical items]

### Short-term (Next Sprint)
- [Important improvements]

### Long-term (Technical Debt)
- [Future considerations]

## Approval

- [ ] Code review complete
- [ ] Tests passing
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

### Errors & Recovery

#### Error 1: Agent 2.3 - Type Mismatch
**Time**: YYYY-MM-DD HH:MM
**Error**: `Type 'X' is not assignable to type 'Y'`
**Resolution**: Updated interface in types file
**Action**: Retry successful
```
