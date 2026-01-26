# Supabase Deployment Workflow

Complete workflow for deploying database changes from preview branch to production with full validation.

## Overview

When a Swarm project uses Supabase preview branches, follow this deployment workflow to safely migrate changes to production.

```
Preview Branch                          Production
┌─────────────────┐                    ┌─────────────────┐
│ 1. Apply        │                    │ 7. Backup       │
│    Migrations   │                    │    Production   │
│       ↓         │                    │       ↓         │
│ 2. Fix Errors   │                    │ 8. Apply        │
│       ↓         │    Consolidate     │    Consolidated │
│ 3. Run Advisors │ ───────────────►   │       ↓         │
│       ↓         │                    │ 9. Fix Errors   │
│ 4. Fix Advisors │                    │       ↓         │
│       ↓         │                    │ 10. Run Advisors│
│ 5. Consolidate  │                    │       ↓         │
│       ↓         │                    │ 11. Verify      │
│ 6. Close Preview│                    │                 │
└─────────────────┘                    └─────────────────┘
```

---

## CLI vs MCP Authorization

Before running commands, check if CLI is authorized:

```bash
# Test CLI authorization
supabase projects list
```

**If CLI is not authorized** (returns auth error), use Supabase MCP tools instead:

| CLI Command | MCP Alternative |
|-------------|-----------------|
| `supabase db push --linked` | Use MCP `apply_migration` tool |
| `supabase db diff --linked` | Use MCP `get_schema` or `diff_schema` tool |
| `supabase branches list` | Use MCP `list_branches` tool |
| `supabase branches delete` | Use MCP `delete_branch` tool |
| Advisors | Use MCP `run_security_advisor` / `run_performance_advisor` |

**To authorize CLI**:
```bash
supabase login
# Or link to specific project
supabase link --project-ref <project-ref>
```

> 💡 **Tip**: MCP tools work regardless of CLI auth status and are often more convenient for automated workflows.

---

## Phase 1: Preview Branch Validation

### Step 1.1: Apply All Migrations

**Via CLI** (if authorized):
```bash
# Reset and apply all migrations to preview
supabase db reset --linked

# Or apply pending migrations only
supabase db push --linked
```

**Via MCP** (if CLI not authorized):
```
Use Supabase MCP tools:
- apply_migration: Apply pending migrations
- run_sql: Execute custom SQL if needed
```

**Loop until success**:
```
while migrations have errors:
    1. Read error output
    2. Fix migration file or create corrective migration
    3. Re-run migration apply (CLI or MCP)
```

### Step 1.2: Resolve Migration Errors

Common error patterns and fixes:

| Error | Fix |
|-------|-----|
| `relation already exists` | Add `IF NOT EXISTS` or drop in down migration |
| `column cannot be cast` | Create intermediate migration with data transformation |
| `violates foreign key` | Ensure referenced data exists or defer constraints |
| `permission denied` | Check RLS policies and grants |

**Error resolution loop**:
```bash
# Check current state (CLI)
supabase db diff --linked

# Or via MCP: use diff_schema tool

# After fix, verify
supabase db push --linked  # or MCP apply_migration
```

### Step 1.3: Run Security & Performance Advisors

**Via MCP** (preferred):
```
Use Supabase MCP tools:
- run_security_advisor: Check auth, RLS, permissions
- run_performance_advisor: Check indexes, query plans
```

**Via Dashboard**:
- Navigate to Database → Advisors
- Run Security Advisor
- Run Performance Advisor

**Check for**:
- 🔴 **Errors**: Must fix before proceeding
- 🟡 **Warnings**: Should fix, may cause issues
- 🔵 **Info**: Recommendations for optimization

### Step 1.4: Resolve Advisor Issues

**Security issues**:
```sql
-- Enable RLS on all tables
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Add missing policies
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

-- Revoke excessive permissions
REVOKE ALL ON table_name FROM anon;
```

**Performance issues**:
```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_name ON table_name(column);

-- Optimize queries flagged by advisor
-- Create composite indexes for common query patterns
CREATE INDEX idx_composite ON table_name(col1, col2);
```

**Loop until clean**:
```
while advisors report issues:
    1. Fix highest severity issue
    2. Create migration for fix
    3. Apply via CLI or MCP
    4. Re-run advisors via MCP
```

### Step 1.5: Consolidate Migrations

Once preview is stable, consolidate multiple migrations into a single, clean migration:

**Via CLI**:
```bash
# Generate consolidated schema diff
supabase db diff --linked -f consolidated_migration

# Review the generated migration
cat supabase/migrations/YYYYMMDDHHmmss_consolidated_migration.sql
```

**Via MCP**:
```
Use diff_schema tool to get the consolidated diff
Manually create migration file from output
```

**Consolidation checklist**:
- [ ] All `CREATE` statements use `IF NOT EXISTS`
- [ ] All `DROP` statements use `IF EXISTS`
- [ ] Data migrations are idempotent
- [ ] Rollback script tested
- [ ] No hardcoded IDs or environment-specific values

### Step 1.6: Close Preview Branch

> ⚠️ **IMPORTANT**: Always close and delete preview branches after consolidation to avoid unnecessary charges.

**Via CLI** (if authorized):
```bash
# List branches to find the preview branch ID
supabase branches list

# Delete the preview branch
supabase branches delete <branch-id>

# Confirm deletion
supabase branches list
```

**Via MCP** (if CLI not authorized):
```
Use Supabase MCP tools:
1. list_branches: Find the preview branch ID/name
2. delete_branch: Remove the preview branch
```

**Via Dashboard**:
1. Navigate to Project Settings → Branches
2. Find the preview branch
3. Click "Delete branch"
4. Confirm deletion

**Verification**:
```bash
# Ensure branch is deleted
supabase branches list  # or MCP list_branches

# Should NOT show the deleted preview branch
```

> 💰 **Cost Note**: Preview branches incur compute charges while active. Always delete after:
> - Successful consolidation and production deployment
> - Abandoned/cancelled projects
> - Long-idle branches (> 7 days without activity)

---

## Phase 2: Production Deployment

### Step 2.1: Backup Production

**If backup script exists** (e.g., studioFE):
```bash
# Run project backup script
./scripts/backup-db.sh production

# Or via npm script
npm run db:backup:production
```

**Manual backup via CLI**:
```bash
# Using Supabase CLI
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql --linked
```

**Via MCP** (if CLI not authorized):
```
Use Supabase MCP backup tools or Dashboard
```

**Verify backup**:
```bash
# Check backup file exists and has content
ls -la backups/
head -100 backups/latest.sql
```

> ⚠️ **CRITICAL**: Never proceed to production deployment without confirmed backup

### Step 2.2: Apply Consolidated Migration to Production

**Via CLI**:
```bash
# Switch to production
supabase link --project-ref <production-ref>

# Apply migration
supabase db push --linked

# Or for more control
supabase migration up --linked
```

**Via MCP**:
```
1. Switch project context to production
2. Use apply_migration tool
```

### Step 2.3: Resolve Production Errors

Same error resolution loop as preview, but with extra caution:

```
while migrations have errors:
    1. Read error output carefully
    2. Assess impact on live data
    3. Create minimal corrective migration
    4. Apply via CLI or MCP
    5. Verify application still functions
```

**Production-specific considerations**:
- Check for active connections before schema changes
- Use `CONCURRENTLY` for index creation
- Consider maintenance window for heavy operations
- Monitor application errors during deployment

### Step 2.4: Run Production Advisors

**Via MCP** (preferred):
```
Use Supabase MCP tools:
- run_security_advisor
- run_performance_advisor
```

**Production-specific checks**:
- Connection pooling configuration
- Read replica configuration (if applicable)
- Backup schedule verification
- Monitoring alerts configured

### Step 2.5: Final Production Backup

After successful deployment:

```bash
# Create post-deployment backup
./scripts/backup-db.sh production --post-deploy

# Or
npm run db:backup:production -- --tag=post-deploy-$(date +%Y%m%d)
```

**Verify deployment**:
```bash
# Run smoke tests
npm run test:smoke

# Check application health
curl -s https://api.example.com/health | jq

# Monitor error rates for 15-30 minutes
```

---

## Quick Reference

### Commands Summary

| Phase | CLI Command | MCP Alternative | Purpose |
|-------|-------------|-----------------|---------|
| Preview | `supabase db reset --linked` | `apply_migration` | Fresh start |
| Preview | `supabase db push --linked` | `apply_migration` | Apply migrations |
| Preview | `supabase db diff --linked` | `diff_schema` | Check state |
| Both | - | `run_security_advisor` | Security check |
| Both | - | `run_performance_advisor` | Performance check |
| Preview | `supabase branches delete` | `delete_branch` | Close preview |
| Prod | `supabase db dump` | Dashboard/API | Backup |
| Prod | `supabase db push --linked` | `apply_migration` | Deploy |
| Prod | `npm run test:smoke` | - | Verify |

### Deployment Checklist

```markdown
## Pre-Production Checklist

### Preview Validation
- [ ] All migrations applied successfully
- [ ] No migration errors
- [ ] Security advisor: 0 errors, 0 warnings
- [ ] Performance advisor: 0 errors, 0 warnings
- [ ] Migrations consolidated and reviewed
- [ ] Preview branch closed and deleted ← NEW

### Production Deployment
- [ ] Production backup created and verified
- [ ] Maintenance window scheduled (if needed)
- [ ] Team notified of deployment
- [ ] Consolidated migration applied
- [ ] All production errors resolved
- [ ] Production advisors pass
- [ ] Post-deployment backup created
- [ ] Smoke tests passing
- [ ] Monitoring verified (15-30 min)
```

### Rollback Procedure

If production deployment fails:

```bash
# 1. Stop the deployment
# 2. Restore from backup
supabase db restore backups/backup_YYYYMMDD_HHMMSS.sql --linked

# 3. Verify restoration
supabase db diff --linked

# 4. Notify team and document issue
```

---

## Integration with Swarm Protocol

### In AGENT_SWARM_SPEC.md

When a project includes database changes, add a **Database Deployment Phase**:

```markdown
### Phase N: Database Deployment (Sequential)

**Agent N.1: Preview Validation**
- Role: Validate all migrations on preview branch
- Deliverables:
  - [ ] All migrations applied without errors
  - [ ] Security advisor passes (via MCP)
  - [ ] Performance advisor passes (via MCP)
- Validation: `supabase db push --linked` exits 0 (or MCP apply_migration succeeds)

**Agent N.2: Migration Consolidation**
- Role: Consolidate migrations for production
- Files: `supabase/migrations/YYYYMMDDHHmmss_consolidated.sql`
- Deliverables:
  - [ ] Single consolidated migration
  - [ ] Rollback script tested
- Depends on: Agent N.1

**Agent N.3: Preview Cleanup**
- Role: Close and delete preview branch
- Deliverables:
  - [ ] Preview branch deleted (via CLI or MCP)
  - [ ] No active preview branches remaining
- Depends on: Agent N.2

**Agent N.4: Production Deployment**
- Role: Deploy to production with validation
- Deliverables:
  - [ ] Pre-deployment backup confirmed
  - [ ] Migration applied to production
  - [ ] Production advisors pass (via MCP)
  - [ ] Post-deployment backup created
  - [ ] Smoke tests pass
- Depends on: Agent N.3
```

### Progress Display with Database Phase

```
🚀 Swarm: <project-name>
├── Phase 1: Foundation ✅
├── Phase 2: Core ✅
├── Phase 3: Integration ✅
├── Phase 4: Database Deployment (3/4)
│   ├── Agent 4.1: Preview Validation ✅
│   ├── Agent 4.2: Migration Consolidation ✅
│   ├── Agent 4.3: Preview Cleanup ✅
│   │   └── Branch deleted: preview-<project-name>
│   └── Agent 4.4: Production Deployment 🔄
│       ├── Backup: ✅ backup_20240115_143022.sql
│       ├── Migration: ✅ Applied
│       ├── Advisors: 🔄 Running (via MCP)...
│       └── Smoke Tests: ⏳
└── Phase 5: Hardening ⏳
```

---

## Troubleshooting

### CLI Authorization Issues

**Symptom**: `Error: You need to be logged in to run this command`

**Solutions**:
1. Run `supabase login` to authenticate
2. Use MCP tools instead (always authorized via project connection)
3. Check if token expired: `supabase logout && supabase login`

### MCP Connection Issues

**Symptom**: MCP tools not responding

**Solutions**:
1. Verify MCP server is running
2. Check project is linked in MCP configuration
3. Restart MCP server/connection

### Preview Branch Won't Delete

**Symptom**: Branch deletion fails

**Solutions**:
1. Ensure no active connections to preview database
2. Check for running migrations or queries
3. Try via Dashboard if CLI/MCP fails
4. Contact Supabase support if persistent
