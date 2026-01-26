# CLAUDE.md Template Reference

A comprehensive guide for structuring `CLAUDE.md` files based on production patterns.

---

## YAML Frontmatter Format

Every CLAUDE.md should start with YAML frontmatter for metadata:

```yaml
---
title: CLAUDE.md - Development Guide
status: Active
last_updated: 2026-01-26
owner: Team Name <team@company.com>
tags: [guide, claude-code, development, reference]
---
```

### Frontmatter Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `title` | Yes | Document title | `CLAUDE.md - Development Guide` |
| `status` | Yes | Document state | `Active`, `Draft`, `Archived` |
| `last_updated` | Yes | ISO date | `2026-01-26` |
| `owner` | Yes | Maintainer info | `Team <email>` |
| `tags` | No | Searchable tags | `[guide, api, reference]` |

---

## Document Header

After frontmatter, include a brief header with repository info:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

**Repository**: org/repo-name | **Documentation**: https://docs.example.com

> **Important Standards**: See [POLICY.md](./docs/POLICY.md)

---
```

---

## Quick Reference Section

The Quick Reference section should be immediately accessible:

```markdown
## Quick Reference

**Production**: https://app.example.com | **Stack**: Next.js 16 + React 19 + TypeScript 5.9

**Key Commands**:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run linter |
| `npm run test` | Run test suite |
| `npm run typecheck` | TypeScript validation |

**Essential Docs**:

- [Getting Started](./docs/GETTING_STARTED.md) - Setup and first steps
- [API Reference](./docs/API_REFERENCE.md) - Endpoint documentation
- [Architecture](./docs/ARCHITECTURE.md) - System design
- [Deployment](./docs/DEPLOYMENT.md) - Production deployment

---
```

### Key Commands Table Format

Use a clean table or code block for commands:

**Table Format** (best for many commands):
```markdown
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
```

**Code Block Format** (best for detailed commands):
```markdown
```bash
npm run dev          # Start dev server (default port 3000)
npm run dev:local    # Dev with local services
npm run build        # Production build
npm run lint         # ESLint (use CLI, not IDE)
```
```

---

## Essential Docs Links Pattern

Group documentation by category with consistent formatting:

```markdown
**Essential Docs**:

- [Feature Guide](./docs/FEATURE.md) - Feature patterns & best practices
- [Configuration](./docs/CONFIG.md) - Config management
- [API Reference](./docs/API.md) - Endpoint docs
- [Deployment](./docs/DEPLOY.md) - Production info
```

### Link Format Rules

1. Use relative paths from repo root: `./docs/FILE.md`
2. Include brief description after dash
3. Group related docs together
4. Keep descriptions under 10 words

---

## Architecture Overview Section

Document the system architecture clearly:

```markdown
## Architecture Overview

### Deployment

- **Frontend**: Vercel serverless (app.example.com)
- **API**: AWS Lambda / Railway
- **Database**: PostgreSQL + pgvector
- **Cache**: Redis Cloud
- **Queue**: BullMQ / PGMQ

**Docs**: [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

### Core Stack

- Next.js 16.0.0 + React 19.2.0 + TypeScript 5.9.3
- OpenAI SDK v6 (6.4.0)
- Tailwind CSS 4.x + shadcn/ui

### Key Directories

```
src/
├── app/             # Next.js App Router pages
├── components/      # React components
│   └── ui/          # shadcn/ui components
├── lib/             # Utilities & configurations
├── services/        # Business logic & data access
├── types/           # TypeScript definitions
└── proxy.ts         # Request proxy (Next.js 16)
```

**Important Notes**:
- Next.js 16 uses `proxy.ts` instead of `middleware.ts`
- All services use dependency injection pattern

---
```

---

## Environment/Configuration Section

Document environment setup and configuration patterns:

```markdown
## Environment & Configuration

### Environment Detection

Use centralized config for environment checks:

```typescript
// Environment detection
import { isProduction, isDevelopment, isTest } from '@/config';

if (isProduction()) { /* production-only logic */ }
if (isDevelopment()) { /* dev-only logic */ }
```

### Configuration Priority

1. Database config (runtime changeable)
2. Environment variables
3. Default values

```typescript
const configService = getConfigurationService();
const config = await configService.getByKey('SETTING_KEY');
const value = config?.value || process.env.SETTING_KEY || 'default';
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection |
| `REDIS_URL` | Yes | Redis connection |
| `API_KEY` | Yes | External API key |
| `DEBUG` | No | Enable debug mode |

**Rules**:
- Secrets (API keys, tokens) -> `.env.local` only
- Configurations (models, limits) -> Database with env fallback
- Always implement fallback chain: DB -> env -> default

**Docs**: [CONFIGURATION.md](./docs/CONFIGURATION.md)

---
```

---

## Development Patterns Section

Document key development patterns:

```markdown
## Development Patterns

### API Pattern

All API routes follow this structure:

```typescript
// src/app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  field: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validated = RequestSchema.parse(body);

  // Business logic
  const result = await service.process(validated);

  return NextResponse.json(result);
}
```

### Component Pattern

- shadcn/ui + Radix UI primitives
- Mobile-first responsive design
- WCAG 2.1 Level AA compliance

**Shared Components** (`src/components/common/`):
- `LoadingState`, `EmptyState`, `ErrorState` - State displays
- `StatusBadge` - Configurable status indicators
- `Pagination` - Reusable pagination

### Data Fetching Pattern

Use standardized hooks for client-side fetching:

```typescript
import { useFetch, usePolling } from '@/hooks';

// One-time fetch
const { data, isLoading, error } = useFetch<User[]>({
  url: '/api/users',
});

// Polling for real-time data
const { data, refresh } = usePolling<HealthResponse>({
  tier: 'FAST',  // 10s interval
  fetcher: async (signal) => fetch('/api/health', { signal }),
});
```

**Docs**: [PATTERNS.md](./docs/PATTERNS.md)

---
```

---

## Development Guidelines Section

Document team standards and practices:

```markdown
## Development Guidelines

### Git Workflow

- **Commit format**: `<type>(<scope>): <description>` (50 char max)
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Don't commit until work is confirmed complete
- Use feature branches: `feature/project-name`

### Code Standards

- TypeScript strict mode (no `any`)
- Test coverage >90%
- Security: OWASP compliance mandatory
- Remove unused code (no backwards-compatibility hacks)

### Testing

```bash
npm run test              # Full suite
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:integration  # Integration tests
```

### Documentation

- Keep docs in sync with code changes
- Update CLAUDE.md for major changes only
- Reference detailed docs instead of inline

---
```

---

## Complete Template

Here's a complete CLAUDE.md template:

```markdown
---
title: CLAUDE.md - Development Guide
status: Active
last_updated: 2026-01-26
owner: Team Name <team@company.com>
tags: [guide, claude-code, development]
---

# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

**Repository**: org/repo | **Documentation**: https://docs.example.com

---

## Quick Reference

**Production**: https://app.example.com | **Stack**: Next.js 16 + TypeScript

**Key Commands**:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run linter |
| `npm run test` | Run test suite |

**Essential Docs**:

- [Getting Started](./docs/GETTING_STARTED.md) - Setup guide
- [API Reference](./docs/API.md) - Endpoint documentation
- [Deployment](./docs/DEPLOYMENT.md) - Production deployment

---

## Active Projects

### Project Name

**Status**: In Progress
**Branch**: `feature/project-name`
**Documentation**: [docs/projects/project-name/](./docs/projects/project-name/)

Brief description of the project and its goals.

**Key Files**:
- Service: `src/services/project-service.ts`
- API: `src/app/api/project/route.ts`
- Tests: `src/tests/project/`

---

## Architecture Overview

### Deployment

- **Frontend**: Vercel (app.example.com)
- **Database**: PostgreSQL + pgvector
- **Cache**: Redis

### Key Directories

```
src/
├── app/             # Next.js App Router
├── components/      # React components
├── services/        # Business logic
└── types/           # TypeScript definitions
```

---

## Development Guidelines

**Git**: `<type>(<scope>): <description>` format
**Code**: TypeScript strict, >90% coverage
**Testing**: `npm run test`

---

## Additional Resources

- [Architecture](./docs/ARCHITECTURE.md)
- [Configuration](./docs/CONFIGURATION.md)
- [Contributing](./CONTRIBUTING.md)
```

---

## Best Practices

1. **Keep it scannable**: Use tables and bullet points
2. **Link don't inline**: Reference detailed docs instead of duplicating
3. **Update regularly**: Review monthly, update `last_updated`
4. **Focus on context**: What Claude needs to know, not what's in code
5. **Section order**: Quick Reference first, then active work, then architecture
6. **Consistent formatting**: Same patterns throughout
