# Centralization Patterns

Patterns for centralizing configuration, environment detection, and domain management.

---

## Config Barrel Pattern

Create a single entry point for all configuration:

```typescript
// src/config/index.ts
export * from './environment';
export * from './domains';
export * from './services';
export * from './workers';
export * from './polling';
```

Usage across the codebase:

```typescript
import {
  env, isProduction, isRailway, getPlatform,
  PRODUCTION_DOMAINS, isAllowedDomain,
  getServiceUrl,
} from '@/config';
```

---

## Environment Detection

### Environment State Object

```typescript
// src/config/environment.ts
export type Platform = 'vercel' | 'railway' | 'local' | 'unknown';

export interface EnvironmentState {
  readonly NODE_ENV: string | undefined;
  readonly VERCEL_ENV: string | undefined;
  readonly RAILWAY_ENVIRONMENT_ID: string | undefined;
  readonly isProduction: boolean;
  readonly isDevelopment: boolean;
  readonly isTest: boolean;
  readonly isVercel: boolean;
  readonly isRailway: boolean;
  readonly isLocal: boolean;
  readonly platform: Platform;
}

function computeEnvironmentState(): EnvironmentState {
  const NODE_ENV = process.env.NODE_ENV;
  const VERCEL_ENV = process.env.VERCEL_ENV;
  const RAILWAY_ENVIRONMENT_ID = process.env.RAILWAY_ENVIRONMENT_ID;

  const isProduction = NODE_ENV === 'production';
  const isDevelopment = NODE_ENV === 'development';
  const isTest = NODE_ENV === 'test';
  const isVercel = VERCEL_ENV !== undefined;
  const isRailway = RAILWAY_ENVIRONMENT_ID !== undefined;
  const isLocal = !isVercel && !isRailway;

  const platform: Platform = isVercel
    ? 'vercel'
    : isRailway
      ? 'railway'
      : isLocal
        ? 'local'
        : 'unknown';

  return Object.freeze({
    NODE_ENV,
    VERCEL_ENV,
    RAILWAY_ENVIRONMENT_ID,
    isProduction,
    isDevelopment,
    isTest,
    isVercel,
    isRailway,
    isLocal,
    platform,
  });
}

export const env: EnvironmentState = computeEnvironmentState();

// Convenience functions
export const isProduction = (): boolean => env.isProduction;
export const isDevelopment = (): boolean => env.isDevelopment;
export const isTest = (): boolean => env.isTest;
export const isVercel = (): boolean => env.isVercel;
export const isRailway = (): boolean => env.isRailway;
export const isLocal = (): boolean => env.isLocal;
export const getPlatform = (): Platform => env.platform;
```

### Migration from Scattered Checks

```typescript
// Before (scattered)
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY_ENVIRONMENT_ID !== undefined;

// After (centralized)
import { isProduction, isRailway } from '@/config';
if (isProduction() || isRailway()) { ... }
```

---

## Domain Configuration

### Domain Registry

```typescript
// src/config/domains.ts
export const PRODUCTION_DOMAINS = {
  PRIMARY: 'app.example.com',
  PREVIEW: 'preview.app.example.com',
  DOCS: 'docs.example.com',
  API: 'api.example.com',
} as const;

export type ProductionDomain = typeof PRODUCTION_DOMAINS[keyof typeof PRODUCTION_DOMAINS];

export function getAllDomains(): string[] {
  return Object.values(PRODUCTION_DOMAINS);
}

export function getSecurityScanDomains(): string[] {
  return [PRODUCTION_DOMAINS.PRIMARY, PRODUCTION_DOMAINS.PREVIEW];
}
```

### Domain Validation with Memoization

```typescript
const domainValidationCache = new Map<string, boolean>();
const MAX_CACHE_SIZE = 100;

export function isAllowedDomain(url: string): boolean {
  // Check cache
  const cached = domainValidationCache.get(url);
  if (cached !== undefined) {
    // LRU: move to end
    domainValidationCache.delete(url);
    domainValidationCache.set(url, cached);
    return cached;
  }

  // Validate
  try {
    const { hostname } = new URL(url);
    const allowed = getAllDomains().some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );

    // Evict oldest if at capacity
    if (domainValidationCache.size >= MAX_CACHE_SIZE) {
      const oldest = domainValidationCache.keys().next().value;
      domainValidationCache.delete(oldest);
    }

    domainValidationCache.set(url, allowed);
    return allowed;
  } catch {
    return false;
  }
}
```

---

## Service Configuration

### Railway Services Registry

```typescript
// src/config/services.ts
export const RAILWAY_SERVICES = {
  WORKER: {
    name: 'worker',
    domain: 'worker.railway.app',
    healthPath: '/health',
  },
  SECURITY: {
    name: 'security-scanner',
    domain: 'security.railway.app',
    healthPath: '/api/health',
  },
} as const;

export type ServiceKey = keyof typeof RAILWAY_SERVICES;

export function getServiceUrl(key: ServiceKey): string {
  const service = RAILWAY_SERVICES[key];
  return `https://${service.domain}`;
}

export function getServiceHealthUrl(key: ServiceKey): string {
  const service = RAILWAY_SERVICES[key];
  return `https://${service.domain}${service.healthPath}`;
}

export function getAllRailwayDomains(): string[] {
  return Object.values(RAILWAY_SERVICES).map((s) => s.domain);
}
```

---

## Database Configuration

### Config Service with Fallback Chain

```typescript
// src/lib/config.ts
import { getConfigurationService } from '@/services/configuration-service';

interface ConfigMetrics {
  hits: number;
  misses: number;
  errors: number;
  lastError?: { key: string; timestamp: Date; message: string };
}

const metrics: ConfigMetrics = { hits: 0, misses: 0, errors: 0 };

export async function getConfig(
  key: string,
  defaultValue: string = ''
): Promise<string> {
  try {
    // 1. Try database
    const configService = getConfigurationService();
    const config = await configService.getByKey(key);

    if (config?.value != null) {
      metrics.hits++;
      return config.value;
    }

    metrics.misses++;

    // 2. Try environment variable
    if (Object.hasOwn(process.env, key)) {
      const envValue = process.env[key];
      if (envValue !== undefined) return envValue;
    }

    // 3. Return default
    return defaultValue;
  } catch (error) {
    metrics.errors++;
    metrics.lastError = {
      key,
      timestamp: new Date(),
      message: error instanceof Error ? error.message : 'Unknown error',
    };

    // Fallback to env on error
    return process.env[key] ?? defaultValue;
  }
}

// Type-safe variants
export async function getConfigNumber(
  key: string,
  defaultValue: number
): Promise<number> {
  const value = await getConfig(key, String(defaultValue));
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

export async function getConfigBoolean(
  key: string,
  defaultValue: boolean
): Promise<boolean> {
  const value = await getConfig(key, String(defaultValue));
  return value === 'true' || value === '1';
}

export function getConfigMetrics(): Readonly<ConfigMetrics> {
  return { ...metrics };
}
```

### Configuration Hierarchy

```
Priority (highest to lowest):
1. Database (system_configuration table)
2. Environment variables (.env.local)
3. Hardcoded defaults

Rule: Secrets → .env.local ONLY
      Configs → Database with fallback
```

---

## Polling Configuration

### Tiered Polling Intervals

```typescript
// src/config/polling.ts
export const POLLING_INTERVALS = {
  FAST: 10_000,    // 10 seconds - critical dashboards
  MEDIUM: 30_000,  // 30 seconds - standard monitoring
  SLOW: 60_000,    // 60 seconds - background checks
} as const;

export type PollingTier = keyof typeof POLLING_INTERVALS;

export function getPollingInterval(tier: PollingTier): number {
  return POLLING_INTERVALS[tier];
}
```

Usage with visibility-aware polling:

```typescript
import { POLLING_INTERVALS } from '@/config';
import { usePolling } from '@/hooks';

const { data } = usePolling({
  tier: 'FAST',
  fetcher: async (signal) => fetch('/api/health', { signal }).then(r => r.json()),
});
```

---

## Best Practices

1. **Single source of truth**: All config in `@/config`
2. **Immutable state**: Use `Object.freeze()` for environment state
3. **Type safety**: Export types alongside values
4. **Memoization**: Cache expensive validations
5. **Fallback chain**: DB → env → default (never fail)
6. **Metrics**: Track config access patterns
7. **No secrets in DB**: API keys stay in `.env.local`
