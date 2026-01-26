# Deployment Patterns

Infrastructure patterns for hybrid cloud deployment using Vercel, Railway, Supabase, and Redis Cloud.

## Architecture Overview

```
                    ┌─────────────────────────────────────┐
                    │           Production                │
                    └─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│    Vercel     │         │    Railway    │         │   Supabase    │
│  (Frontend)   │◄───────►│   (Workers)   │◄───────►│  (Database)   │
│    + API      │         │  BullMQ/PGMQ  │         │   + pgvector  │
└───────────────┘         └───────────────┘         └───────────────┘
        │                           │                           │
        │                           ▼                           │
        │                 ┌───────────────┐                     │
        └────────────────►│  Redis Cloud  │◄────────────────────┘
                          │    (Cache)    │
                          └───────────────┘
```

## Platform Responsibilities

### Vercel (Frontend + API)

- **Next.js application** - SSR, App Router, API routes
- **Edge functions** - Low-latency middleware (proxy.ts in Next.js 16)
- **Serverless functions** - API endpoints with auto-scaling
- **CDN** - Static assets and ISR pages

```typescript
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"],  // Primary region
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Railway (Background Workers)

- **BullMQ queues** - User-facing jobs requiring fast feedback
- **PGMQ queues** - Background jobs using PostgreSQL
- **Long-running processes** - Jobs exceeding Vercel's 60s limit
- **Scheduled tasks** - Cron jobs and recurring processes

```typescript
// Worker deployment
{
  "build": { "command": "npm run build:workers" },
  "start": { "command": "npm run start:workers" }
}
```

### Supabase (Database)

- **PostgreSQL** - Primary data store
- **pgvector** - Vector embeddings and similarity search
- **PGMQ** - PostgreSQL-native message queue
- **Row Level Security** - Fine-grained access control

### Redis Cloud (Cache + Queues)

- **BullMQ backend** - Job queue persistence
- **Application cache** - Session data, API responses
- **Rate limiting** - Request throttling state

## Environment Detection

Centralized environment detection utilities:

```typescript
// src/config/environment.ts

export const env = process.env.NODE_ENV || 'development';

// Platform detection
export function isProduction(): boolean {
  return env === 'production';
}

export function isDevelopment(): boolean {
  return env === 'development';
}

export function isTest(): boolean {
  return env === 'test';
}

// Runtime detection
export function isVercel(): boolean {
  return process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
}

export function isRailway(): boolean {
  return process.env.RAILWAY_ENVIRONMENT_ID !== undefined;
}

export function isLocal(): boolean {
  return !isVercel() && !isRailway();
}

// Platform identifier
export function getPlatform(): 'vercel' | 'railway' | 'local' {
  if (isVercel()) return 'vercel';
  if (isRailway()) return 'railway';
  return 'local';
}
```

### Usage Pattern

```typescript
// Replace scattered checks with centralized imports
import { isProduction, isRailway, isVercel, getPlatform } from '@/config';

// Conditional logic by environment
if (isProduction()) {
  // Production-only code (logging, monitoring)
}

// Platform-specific behavior
if (isRailway()) {
  // Railway worker-specific logic
  startBackgroundProcessing();
}

if (isVercel()) {
  // Vercel-specific optimizations
  enableEdgeCaching();
}

// Logging platform info
console.log(`Running on ${getPlatform()} in ${env} mode`);
```

### Migration from Scattered Checks

```typescript
// Before (scattered, inconsistent)
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY_ENVIRONMENT_ID !== undefined;
const isProd = process.env.VERCEL_ENV === 'production';

// After (centralized, consistent)
import { isProduction, isRailway, isVercel } from '@/config';

if (isProduction() || isRailway()) {
  // Unified production/worker logic
}
```

## Domain Configuration

### Production Domains

```typescript
// src/config/domains.ts

export const PRODUCTION_DOMAINS = {
  primary: 'https://app.example.com',
  api: 'https://api.example.com',
  docs: 'https://docs.example.com',
  preview: 'https://preview.example.com',
} as const;

export const RAILWAY_SERVICES = {
  worker: {
    name: 'worker',
    domain: 'worker.railway.internal',
  },
  scheduler: {
    name: 'scheduler',
    domain: 'scheduler.railway.internal',
  },
} as const;

// Domain utilities
export function getAllDomains(): string[] {
  return [
    ...Object.values(PRODUCTION_DOMAINS),
    ...Object.values(RAILWAY_SERVICES).map(s => `https://${s.domain}`),
  ];
}

export function isAllowedDomain(url: string): boolean {
  const allowed = getAllDomains();
  return allowed.some(domain => url.startsWith(domain));
}

export function getServiceUrl(service: keyof typeof RAILWAY_SERVICES): string {
  const svc = RAILWAY_SERVICES[service];
  return isProduction()
    ? `https://${svc.domain}`
    : `http://localhost:${getLocalPort(service)}`;
}
```

## Hybrid Queue Architecture

### Queue Selection Strategy

| Queue Type | Use Case | Backend | Latency |
|------------|----------|---------|---------|
| **BullMQ** | User-facing jobs | Redis | <100ms |
| **PGMQ** | Background processing | PostgreSQL | <500ms |

### BullMQ (User-Facing)

```typescript
// Fast feedback jobs
import { Queue, Worker } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Producer (Vercel API)
const queue = new Queue('user-tasks', { connection });
await queue.add('process', { userId, data }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
});

// Consumer (Railway Worker)
const worker = new Worker('user-tasks', async (job) => {
  const { userId, data } = job.data;
  return await processUserTask(userId, data);
}, { connection });
```

### PGMQ (Background Processing)

```typescript
// Long-running background jobs
import { createPGMQClient } from '@/lib/pgmq';

const pgmq = createPGMQClient();

// Producer
await pgmq.send('background-jobs', {
  type: 'data-sync',
  payload: { sourceId, targetId },
});

// Consumer (Railway Worker)
while (true) {
  const messages = await pgmq.read('background-jobs', { limit: 10 });
  for (const msg of messages) {
    await processBackgroundJob(msg.payload);
    await pgmq.delete('background-jobs', msg.id);
  }
}
```

## Environment Variables

### Required Variables

```bash
# Vercel (.env.production)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXT_PUBLIC_APP_URL=https://app.example.com

# Railway (Service Variables)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
RAILWAY_ENVIRONMENT_ID=<auto-injected>
```

### Variable Patterns

```typescript
// Type-safe environment access
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

// Usage
const databaseUrl = getRequiredEnv('DATABASE_URL');
const logLevel = getOptionalEnv('LOG_LEVEL', 'info');
```

## Health Checks

### Vercel Health Endpoint

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    timestamp: new Date().toISOString(),
  };

  const healthy = Object.values(checks).every(c =>
    typeof c === 'string' || c.status === 'ok'
  );

  return Response.json(checks, {
    status: healthy ? 200 : 503
  });
}
```

### Railway Worker Health

```typescript
// Worker health server
import { createServer } from 'http';

const healthServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      worker: process.env.RAILWAY_SERVICE_NAME,
      uptime: process.uptime(),
    }));
  }
});

healthServer.listen(process.env.PORT || 3001);
```

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Redis connection verified
- [ ] Health checks passing locally

### Vercel Deployment

- [ ] `vercel.json` configured
- [ ] Build command succeeds
- [ ] Preview deployment tested
- [ ] Production deployment promoted

### Railway Deployment

- [ ] Service configured with correct start command
- [ ] Environment variables set
- [ ] Health check endpoint responsive
- [ ] Logs monitored during initial deployment

### Post-Deployment

- [ ] Health endpoints returning 200
- [ ] Queue processing confirmed
- [ ] Error monitoring active
- [ ] Performance baseline established
