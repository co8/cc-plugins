# Agent Patterns

Common agent configurations for different project types.

## Pattern: Full-Stack Feature

Standard pattern for adding a complete feature with database, API, and UI.

```
Phase 1: Foundation (Sequential)
├── Agent 1.1: Database Schema
└── Agent 1.2: Type Definitions

Phase 2: Core (Parallel)
├── Agent 2.1: API Routes
├── Agent 2.2: Service Layer
├── Agent 2.3: UI Components
└── Agent 2.4: State Management

Phase 3: Integration (Partial Parallel)
├── Agent 3.1: Page Integration
└── Agent 3.2: Navigation

Phase 4: Hardening (Sequential)
├── Agent 4.1: Testing
└── Agent 4.2: Documentation
```

**Total Agents**: 10
**Estimated Duration**: 2-4 hours
**Best For**: CRUD features, dashboards, admin panels

---

## Pattern: Full-Stack Feature + Supabase Deployment

Extended pattern with database deployment phase for projects using Supabase preview branches.

```
Phase 1: Foundation (Sequential)
├── Agent 1.1: Database Schema
└── Agent 1.2: Type Definitions

Phase 2: Core (Parallel)
├── Agent 2.1: API Routes
├── Agent 2.2: Service Layer
├── Agent 2.3: UI Components
└── Agent 2.4: State Management

Phase 3: Integration (Partial Parallel)
├── Agent 3.1: Page Integration
└── Agent 3.2: Navigation

Phase 4: Testing (Sequential)
├── Agent 4.1: Unit/Integration Tests
└── Agent 4.2: E2E Tests

Phase 5: Database Deployment (Sequential) ← NEW
├── Agent 5.1: Preview Validation
├── Agent 5.2: Migration Consolidation
└── Agent 5.3: Production Deployment

Phase 6: Finalization (Sequential)
└── Agent 6.1: Documentation & Cleanup
```

**Total Agents**: 12
**Estimated Duration**: 3-5 hours
**Best For**: Features with schema changes requiring production deployment

---

## Pattern: Database Deployment (Standalone)

Use when deploying accumulated database changes to production.

```
Phase 1: Preview Validation (Sequential)
├── Agent 1.1: Apply Migrations
├── Agent 1.2: Resolve Errors
└── Agent 1.3: Run Advisors

Phase 2: Consolidation (Sequential)
├── Agent 2.1: Fix Advisor Issues
└── Agent 2.2: Consolidate Migrations

Phase 3: Production (Sequential)
├── Agent 3.1: Backup Production
├── Agent 3.2: Apply Migration
├── Agent 3.3: Resolve Errors
├── Agent 3.4: Run Advisors
└── Agent 3.5: Post-Deploy Backup
```

**Total Agents**: 10
**Estimated Duration**: 1-2 hours
**Best For**: Database-only deployments, schema updates

### Agent Definitions for Database Deployment

```markdown
### Agent 1.1: Apply Migrations

**Role**: Apply all pending migrations to preview branch

**Validation**:
```bash
supabase db push --linked
# Must exit with code 0
```

**Loop**: If errors, fix and retry until success

---

### Agent 1.2: Resolve Migration Errors

**Role**: Fix all migration errors on preview

**Deliverables**:
- [ ] All migrations apply without errors
- [ ] `supabase db push --linked` exits 0

**Loop**: Fix → Push → Check → Repeat until clean

---

### Agent 1.3: Run Advisors

**Role**: Execute security and performance advisors

**Validation**:
```bash
# Via Supabase MCP or Dashboard
# Check: Security Advisor
# Check: Performance Advisor
```

**Deliverables**:
- [ ] Advisor reports generated
- [ ] Issues documented

---

### Agent 2.1: Fix Advisor Issues

**Role**: Resolve all advisor errors, warnings, and info items

**Deliverables**:
- [ ] Security advisor: 0 errors, 0 warnings, 0 info
- [ ] Performance advisor: 0 errors, 0 warnings, 0 info

**Loop**: Fix highest severity → Re-run → Repeat until all pass

---

### Agent 2.2: Consolidate Migrations

**Role**: Combine development migrations into single production migration

**Files**:
- `supabase/migrations/YYYYMMDDHHmmss_consolidated.sql`

**Deliverables**:
- [ ] Consolidated migration created
- [ ] Uses IF EXISTS / IF NOT EXISTS
- [ ] Idempotent operations
- [ ] Rollback script tested

---

### Agent 3.1: Backup Production

**Role**: Create verified backup before deployment

**Validation**:
```bash
# If backup script exists (studioFE)
./scripts/backup-db.sh production

# Verify backup
ls -la backups/
head -100 backups/latest.sql
```

**Deliverables**:
- [ ] Backup file created
- [ ] Backup verified (non-empty, valid SQL)

**CRITICAL**: Block deployment if backup fails

---

### Agent 3.2: Apply Production Migration

**Role**: Deploy consolidated migration to production

**Validation**:
```bash
supabase link --project-ref <production-ref>
supabase db push --linked
```

**Deliverables**:
- [ ] Migration applied successfully
- [ ] Application still functional

---

### Agent 3.3: Resolve Production Errors

**Role**: Fix any errors during production deployment

**Loop**: Same as preview, with extra caution for live data

**Considerations**:
- Check active connections
- Use CONCURRENTLY for indexes
- Monitor application errors

---

### Agent 3.4: Run Production Advisors

**Role**: Validate production with security/performance advisors

**Deliverables**:
- [ ] Security advisor passes
- [ ] Performance advisor passes
- [ ] No new issues introduced

---

### Agent 3.5: Post-Deploy Backup

**Role**: Create backup after successful deployment

**Validation**:
```bash
./scripts/backup-db.sh production --post-deploy
npm run test:smoke
```

**Deliverables**:
- [ ] Post-deployment backup created
- [ ] Smoke tests passing
- [ ] Monitoring verified (15-30 min)
```

---

## Pattern: API-Only

Backend-focused pattern without UI components.

```
Phase 1: Foundation (Sequential)
├── Agent 1.1: Database Schema
└── Agent 1.2: Type Definitions

Phase 2: Implementation (Parallel)
├── Agent 2.1: API Routes
├── Agent 2.2: Service Layer
└── Agent 2.3: Background Jobs (if needed)

Phase 3: Hardening (Sequential)
├── Agent 3.1: Testing
└── Agent 3.2: API Documentation
```

**Total Agents**: 7
**Estimated Duration**: 1-2 hours
**Best For**: Microservices, webhooks, integrations

---

## Pattern: UI Refactor

Frontend-focused pattern for UI overhauls.

```
Phase 1: Analysis (Sequential)
└── Agent 1.1: Component Audit

Phase 2: Components (Parallel)
├── Agent 2.1: Base Components
├── Agent 2.2: Composite Components
├── Agent 2.3: Layout Components
└── Agent 2.4: Form Components

Phase 3: Integration (Sequential)
├── Agent 3.1: Page Updates
└── Agent 3.2: State Migration

Phase 4: Polish (Parallel)
├── Agent 4.1: Accessibility
├── Agent 4.2: Responsive Design
└── Agent 4.3: Animation/Transitions
```

**Total Agents**: 10
**Estimated Duration**: 2-3 hours
**Best For**: Design system updates, UI modernization

---

## Pattern: Data Migration

Pattern for large data migrations or schema changes.

```
Phase 1: Preparation (Sequential)
├── Agent 1.1: Schema Analysis
├── Agent 1.2: Migration Script
└── Agent 1.3: Rollback Script

Phase 2: Code Updates (Parallel)
├── Agent 2.1: Type Updates
├── Agent 2.2: Query Updates
└── Agent 2.3: API Compatibility Layer

Phase 3: Validation (Sequential)
├── Agent 3.1: Data Integrity Tests
└── Agent 3.2: Performance Tests

Phase 4: Execution (Sequential)
├── Agent 4.1: Backup Verification
└── Agent 4.2: Migration Execution
```

**Total Agents**: 10
**Estimated Duration**: 2-4 hours
**Best For**: Database restructuring, version upgrades

---

## Pattern: Integration

Pattern for third-party service integrations.

```
Phase 1: Research (Sequential)
└── Agent 1.1: API Documentation Review

Phase 2: Foundation (Sequential)
├── Agent 2.1: SDK/Client Setup
└── Agent 2.2: Type Definitions

Phase 3: Implementation (Parallel)
├── Agent 3.1: Core Integration
├── Agent 3.2: Webhook Handlers
└── Agent 3.3: Error Handling

Phase 4: UI (Parallel)
├── Agent 4.1: Settings UI
└── Agent 4.2: Status/Monitoring UI

Phase 5: Hardening (Sequential)
├── Agent 5.1: Integration Tests
└── Agent 5.2: Documentation
```

**Total Agents**: 10
**Estimated Duration**: 2-3 hours
**Best For**: Payment providers, auth providers, SaaS integrations

---

## Pattern: Microservice

Pattern for new standalone microservice.

```
Phase 1: Setup (Sequential)
├── Agent 1.1: Project Scaffold
├── Agent 1.2: Configuration
└── Agent 1.3: Database Setup

Phase 2: Core (Parallel)
├── Agent 2.1: Domain Models
├── Agent 2.2: Repository Layer
├── Agent 2.3: Service Layer
└── Agent 2.4: API Controllers

Phase 3: Infrastructure (Parallel)
├── Agent 3.1: Health Checks
├── Agent 3.2: Logging/Metrics
└── Agent 3.3: Message Queue Integration

Phase 4: DevOps (Sequential)
├── Agent 4.1: Dockerfile
├── Agent 4.2: CI/CD Pipeline
└── Agent 4.3: Kubernetes Manifests
```

**Total Agents**: 13
**Estimated Duration**: 3-5 hours
**Best For**: New services, bounded contexts

---

## Agent Definition Template

```markdown
### Agent X.Y: <n>

**Role**: [Single sentence describing responsibility]

**Files**:
- `path/to/file1.ts`
- `path/to/file2.ts`

**Deliverables**:
- [ ] Deliverable 1
- [ ] Deliverable 2
- [ ] Deliverable 3

**Validation**:
```bash
<command to verify completion>
```

**Depends on**: [Agent X.Z] (or "None")

**Notes**: [Optional additional context]
```

---

## Parallelization Decision Tree

```
Can agents run in parallel?
│
├── Do they modify the same files?
│   ├── Yes → Sequential
│   └── No ↓
│
├── Does one depend on the other's output?
│   ├── Yes → Sequential
│   └── No ↓
│
├── Do they share mutable state?
│   ├── Yes → Sequential
│   └── No → ✅ Parallel OK
```

---

## Common Agent Roles

| Role | Typical Responsibilities |
|------|-------------------------|
| **Schema** | Database migrations, table definitions |
| **Types** | TypeScript interfaces, Zod schemas |
| **API** | Route handlers, middleware, validation |
| **Service** | Business logic, data access |
| **UI** | React components, styling |
| **State** | Zustand stores, React Query hooks |
| **Test** | Unit tests, integration tests, E2E |
| **Docs** | API docs, README updates, comments |
| **DevOps** | CI/CD, Docker, deployment configs |
| **Security** | Auth, authorization, input sanitization |
| **DB Deploy** | Migration validation, advisor fixes, production deployment |
