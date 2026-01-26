# Next.js 16 Patterns

> Detailed patterns: `references/deployment-patterns.md`

## Middleware

- [ ] Use `src/proxy.ts` (NOT `middleware.ts`)
- [ ] Handle edge runtime limitations
- [ ] Configure matcher patterns correctly

## App Router

- [ ] Use `app/` directory structure
- [ ] Prefer Server Components by default
- [ ] Add `'use client'` only when needed
- [ ] Use route groups `(group)` for organization
- [ ] Implement parallel routes with `@folder`

## Server Actions

- [ ] Mark with `'use server'` directive
- [ ] Validate all inputs with Zod
- [ ] Return typed responses
- [ ] Handle errors gracefully
- [ ] Use `revalidatePath()` / `revalidateTag()` for cache

## Route Handlers

- [ ] Use `route.ts` for API endpoints
- [ ] Export named HTTP methods (`GET`, `POST`, etc.)
- [ ] Return `NextResponse.json()` for JSON
- [ ] Handle errors with proper status codes

## Linting

- [ ] Use `npm run lint` (NOT `next lint`)
- [ ] Configure ESLint with Next.js rules
- [ ] Enable TypeScript strict mode

## Turbopack

- [ ] Use `next dev --turbopack` for development
- [ ] Check compatibility for custom webpack configs
- [ ] Test builds with both bundlers

## Data Fetching

- [ ] Use `fetch()` with caching options
- [ ] Configure `revalidate` for ISR
- [ ] Use `unstable_cache()` for custom caching
- [ ] Implement Suspense boundaries

## Common Patterns

```typescript
// Server Action
'use server';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

export async function subscribe(formData: FormData) {
  const result = schema.safeParse({ email: formData.get('email') });
  if (!result.success) return { error: result.error.flatten() };
  // ...
}

// Route Handler
export async function GET(request: Request) {
  return NextResponse.json({ data: [] });
}
```
