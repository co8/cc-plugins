# Agent Swarm Specification: secret-sauce

## Phase Overview

| Phase | Name | Agents | Parallel | Dependencies |
|-------|------|--------|----------|--------------|
| 1 | Foundation | 2 | No | None |
| 2 | Content Extraction | 5 | Yes | Phase 1 |
| 3 | Rules & Templates | 2 | Yes | Phase 1 |
| 4 | Finalization | 1 | No | Phase 2, 3 |

---

## Phase 1: Foundation (Sequential)

### Agent 1.1: Plugin Configuration

**Role**: Create plugin.json and marketplace.json

**Files**:
- `plugins/secret-sauce/.claude-plugin/plugin.json`
- `plugins/secret-sauce/.claude-plugin/marketplace.json`

**Deliverables**:
- [x] Plugin metadata defined
- [x] Marketplace listing complete
- [x] Version set to 1.0.0

**Validation**: Files exist and are valid JSON

---

### Agent 1.2: Skill Index

**Role**: Create SKILL.md with frontmatter and index

**Files**:
- `plugins/secret-sauce/skills/secret-sauce/SKILL.md`

**Deliverables**:
- [x] YAML frontmatter with triggers
- [x] Index of all references
- [x] Quick reference tables

**Depends on**: Agent 1.1

---

## Phase 2: Content Extraction (Parallel)

### Agent 2.1: CLAUDE.md Patterns

**Role**: Extract CLAUDE.md structure and patterns from studioFE

**Files**:
- `plugins/secret-sauce/skills/secret-sauce/references/claude-md-template.md`
- `plugins/secret-sauce/skills/secret-sauce/references/project-tracking.md`

**Deliverables**:
- [x] Full CLAUDE.md template with sections
- [x] Project status tracking format
- [x] Frontmatter patterns

---

### Agent 2.2: Coding Standards

**Role**: Extract coding patterns from studioFE

**Files**:
- `plugins/secret-sauce/skills/secret-sauce/references/coding-standards.md`
- `plugins/secret-sauce/skills/secret-sauce/references/ai-flow-patterns.md`
- `plugins/secret-sauce/skills/secret-sauce/references/data-fetching.md`

**Deliverables**:
- [x] TypeScript strict mode patterns
- [x] AI flow development guide
- [x] Data fetching hooks patterns

---

### Agent 2.3: Infrastructure Patterns

**Role**: Extract deployment and infrastructure patterns

**Files**:
- `plugins/secret-sauce/skills/secret-sauce/references/deployment-patterns.md`
- `plugins/secret-sauce/skills/secret-sauce/references/supabase-patterns.md`

**Deliverables**:
- [x] Vercel + Railway hybrid patterns
- [x] Supabase migration and MCP patterns
- [x] Configuration management

---

### Agent 2.4: Workflow Patterns

**Role**: Extract git and testing workflows

**Files**:
- `plugins/secret-sauce/skills/secret-sauce/references/git-workflows.md`
- `plugins/secret-sauce/skills/secret-sauce/references/testing-patterns.md`

**Deliverables**:
- [x] Commit format and branch strategy
- [x] PR templates
- [x] Test coverage patterns

---

### Agent 2.5: Tool Configuration

**Role**: Extract browser automation and version management

**Files**:
- `plugins/secret-sauce/skills/secret-sauce/references/browser-automation.md`
- `plugins/secret-sauce/skills/secret-sauce/references/version-management.md`

**Deliverables**:
- [x] Tool selection matrix
- [x] Agent Browser workflow
- [x] Multi-file version sync pattern

---

## Phase 3: Rules & Templates (Parallel)

### Agent 3.1: Framework Rules

**Role**: Create framework-specific rule checklists

**Files**:
- `plugins/secret-sauce/rules/typescript.md`
- `plugins/secret-sauce/rules/nextjs.md`
- `plugins/secret-sauce/rules/react.md`
- `plugins/secret-sauce/rules/supabase.md`
- `plugins/secret-sauce/rules/security.md`

**Deliverables**:
- [x] TypeScript strict rules
- [x] Next.js 16 patterns
- [x] React component patterns
- [x] Supabase DB patterns
- [x] OWASP security checklist

---

### Agent 3.2: Project Templates

**Role**: Create project starter templates

**Files**:
- `plugins/secret-sauce/templates/CLAUDE.md.template`
- `plugins/secret-sauce/templates/settings.json.template`
- `plugins/secret-sauce/templates/project-plan.md.template`
- `plugins/secret-sauce/templates/implementation-plan.md.template`
- `plugins/secret-sauce/templates/code-review.md.template`
- `plugins/secret-sauce/templates/changelog.md.template`

**Deliverables**:
- [x] CLAUDE.md starter template
- [x] Settings.json with permissions
- [x] Swarm document templates

---

## Phase 4: Finalization (Sequential)

### Agent 4.1: Documentation & Marketplace

**Role**: Create README and update root marketplace

**Files**:
- `plugins/secret-sauce/README.md`
- `.claude-plugin/marketplace.json` (update)

**Deliverables**:
- [x] README with usage instructions
- [x] Root marketplace updated
- [x] Installation verified

**Depends on**: Agents 2.1-2.5, 3.1-3.2
