# Preferred Tech Stack

Recommended initial tech stack for new projects, based on production patterns.

---

## Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^16.0.0 | Full-stack React framework |
| `react` | ^19.0.0 | UI library |
| `react-dom` | ^19.0.0 | React DOM renderer |
| `typescript` | ^5.9.0 | Type safety |

### Node.js

```json
{
  "engines": {
    "node": "22.x"
  }
}
```

---

## Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^4.0.0 | Utility CSS |
| `@tailwindcss/postcss` | ^4.0.0 | PostCSS plugin |
| `@tailwindcss/typography` | ^0.5.0 | Prose styling |
| `tailwind-merge` | ^3.0.0 | Class conflict resolution |
| `clsx` | ^2.1.0 | Conditional classes |

---

## UI Components

| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/react-*` | ^1.0.0 | Accessible primitives |
| `lucide-react` | ^0.400.0 | Icons |
| `class-variance-authority` | ^0.7.0 | Variant styling |

### Radix Components (commonly used)

```
@radix-ui/react-accordion
@radix-ui/react-alert-dialog
@radix-ui/react-avatar
@radix-ui/react-checkbox
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-label
@radix-ui/react-popover
@radix-ui/react-select
@radix-ui/react-separator
@radix-ui/react-slot
@radix-ui/react-switch
@radix-ui/react-tabs
@radix-ui/react-toast
@radix-ui/react-tooltip
```

---

## State Management

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^5.0.0 | Client state |
| `@tanstack/react-query` | ^5.0.0 | Server state |

### Zustand Store Pattern

```typescript
import { create } from 'zustand';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

### React Query Setup

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});
```

---

## Validation

| Package | Version | Purpose |
|---------|---------|---------|
| `zod` | ^4.0.0 | Schema validation |

### Zod Pattern

```typescript
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;
```

---

## Database

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2.90.0 | Supabase client |
| `@supabase/ssr` | ^0.8.0 | Server-side auth |

### Supabase Client Setup

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

---

## Background Jobs

| Package | Version | Purpose |
|---------|---------|---------|
| `bullmq` | ^5.0.0 | Redis queue (user-facing) |
| `ioredis` | ^5.0.0 | Redis client |

For background processing, use PGMQ (PostgreSQL) to avoid Redis dependency for non-critical jobs.

---

## AI/LLM

| Package | Version | Purpose |
|---------|---------|---------|
| `openai` | ^6.0.0 | OpenAI API |
| `@anthropic-ai/sdk` | ^0.70.0 | Claude API |

### OpenAI Setup

```typescript
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

---

## Data Visualization

| Package | Version | Purpose |
|---------|---------|---------|
| `recharts` | ^3.0.0 | React charts |
| `d3` | ^7.0.0 | Low-level viz |
| `reactflow` | ^11.0.0 | Node-based UI |

---

## Testing

| Package | Version | Purpose |
|---------|---------|---------|
| `jest` | ^30.0.0 | Test runner |
| `@testing-library/react` | ^16.0.0 | Component testing |
| `@playwright/test` | ^1.50.0 | E2E testing |

---

## Logging

| Package | Version | Purpose |
|---------|---------|---------|
| `pino` | ^9.0.0 | Structured logging |
| `pino-pretty` | ^13.0.0 | Dev formatting |

### Pino Setup

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty' }
      : undefined,
});
```

---

## Linting

| Package | Version | Purpose |
|---------|---------|---------|
| `eslint` | ^9.0.0 | Code linting |
| `prettier` | ^3.0.0 | Code formatting |

---

## Initial package.json

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": "22.x"
  },
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.90.0",
    "@supabase/ssr": "^0.8.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "zod": "^4.0.0",
    "tailwind-merge": "^3.0.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.400.0",
    "pino": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.9.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "@tailwindcss/typography": "^0.5.0",
    "eslint": "^9.0.0",
    "jest": "^30.0.0",
    "@testing-library/react": "^16.0.0",
    "@playwright/test": "^1.50.0"
  }
}
```

---

## Directory Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/          # Auth route group
│   ├── (dashboard)/     # Dashboard route group
│   ├── api/             # API routes
│   ├── globals.css      # Tailwind CSS
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/              # shadcn/ui components
│   └── [feature]/       # Feature components
├── config/              # Centralized config
├── hooks/               # Custom React hooks
├── lib/                 # Utilities
│   ├── supabase/        # Supabase clients
│   └── utils.ts         # cn() helper
├── services/            # Business logic
├── types/               # TypeScript types
└── proxy.ts             # Next.js 16 middleware
```

---

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Redis (if using BullMQ)
REDIS_URL=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
