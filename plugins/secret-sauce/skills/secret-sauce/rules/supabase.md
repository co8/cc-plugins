# Supabase DB Patterns

> Detailed patterns: `references/supabase-patterns.md`

## Development Workflow

- [ ] Use Supabase MCP (NOT CLI)
- [ ] Test queries in SQL Editor first
- [ ] Use TypeScript types from `generate_typescript_types`

## Migrations

- [ ] Naming format: `YYYYMMDDHHmmss_description.sql`
- [ ] One logical change per migration
- [ ] Include rollback comments
- [ ] Test migrations on branch database
- [ ] Never modify deployed migrations

## Row Level Security (RLS)

- [ ] Enable RLS on ALL tables
- [ ] Define policies for CRUD operations
- [ ] Use `auth.uid()` for user context
- [ ] Test policies with different roles
- [ ] Avoid overly permissive policies

## RLS Policy Patterns

```sql
-- Read own data
CREATE POLICY "Users read own data"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Insert own data
CREATE POLICY "Users insert own data"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Service role bypass (use carefully)
CREATE POLICY "Service role access"
ON profiles FOR ALL
USING (auth.role() = 'service_role');
```

## Edge Functions

- [ ] Use Deno runtime
- [ ] Handle CORS properly
- [ ] Validate request inputs
- [ ] Use environment variables for secrets
- [ ] Return proper HTTP status codes
- [ ] Implement error handling

## Real-time Subscriptions

- [ ] Enable replication on required tables
- [ ] Use filters to limit payload
- [ ] Handle connection states
- [ ] Implement reconnection logic
- [ ] Clean up subscriptions on unmount

## Performance

- [ ] Create indexes for frequent queries
- [ ] Use `select()` to limit columns
- [ ] Implement pagination with `range()`
- [ ] Use database functions for complex logic
- [ ] Monitor with `pg_stat_statements`

## Common Patterns

```typescript
// Type-safe client
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabase = createClient<Database>(url, key);

// Real-time subscription
const channel = supabase
  .channel('changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'messages' },
    (payload) => console.log(payload)
  )
  .subscribe();

// Cleanup
return () => supabase.removeChannel(channel);
```
