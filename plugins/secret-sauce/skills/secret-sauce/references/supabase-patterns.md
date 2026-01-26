# Supabase Development Patterns

Best practices for Supabase development including migrations, configuration management, vector search, and Row Level Security (RLS).

## Migration Naming Convention

All migration files must follow this naming pattern:

```
YYYYMMDDHHmmss_description.sql
```

### Examples

```
20260126143000_create_users_table.sql
20260126143500_add_email_index.sql
20260126144000_create_embeddings_table.sql
```

### Naming Rules

- **Timestamp**: 14 digits in UTC time
- **Description**: Snake_case, descriptive action
- **Extension**: Always `.sql`

### Common Prefixes

| Prefix | Use Case |
|--------|----------|
| `create_` | New table creation |
| `add_` | Adding columns or indexes |
| `drop_` | Removing objects |
| `alter_` | Modifying existing objects |
| `update_` | Data migrations |
| `enable_` | Enabling features (RLS, extensions) |

## Use MCP Over CLI

**Prefer Supabase MCP tools over CLI commands** for all database operations in Claude Code.

### Available MCP Tools

```typescript
// Search documentation
mcp__plugin_supabase_supabase__search_docs

// Project management
mcp__plugin_supabase_supabase__list_projects
mcp__plugin_supabase_supabase__get_project
mcp__plugin_supabase_supabase__create_project

// Database operations
mcp__plugin_supabase_supabase__list_tables
mcp__plugin_supabase_supabase__list_extensions
mcp__plugin_supabase_supabase__execute_sql

// Migrations
mcp__plugin_supabase_supabase__list_migrations
mcp__plugin_supabase_supabase__apply_migration

// Edge Functions
mcp__plugin_supabase_supabase__list_edge_functions
mcp__plugin_supabase_supabase__deploy_edge_function

// Branching (for development)
mcp__plugin_supabase_supabase__create_branch
mcp__plugin_supabase_supabase__list_branches
mcp__plugin_supabase_supabase__merge_branch
```

### Why MCP Over CLI

1. **Direct integration** - No shell context switching
2. **Error handling** - Structured responses
3. **Authentication** - Managed automatically
4. **Consistency** - Same interface across environments

## Configuration System

### Three-Tier Fallback Pattern

Configuration values should follow this priority chain:

```
Database → Environment Variable → Default Value
```

### Implementation

```typescript
import { getConfigurationService } from '@/services/system-configuration-service';

const configService = getConfigurationService();

// Fetch with fallback chain
async function getConfig(key: string, defaultValue: string): Promise<string> {
  // 1. Try database first
  const dbConfig = await configService.getByKey(key);
  if (dbConfig?.value) {
    return dbConfig.value;
  }

  // 2. Fall back to environment variable
  const envValue = process.env[key];
  if (envValue) {
    return envValue;
  }

  // 3. Use default value
  return defaultValue;
}

// Usage
const model = await getConfig('OPENAI_MODEL', 'gpt-4o-2024-11-20');
const maxTokens = parseInt(await getConfig('MAX_TOKENS', '4096'));
```

### Configuration Service

```typescript
// src/services/system-configuration-service.ts

interface SystemConfiguration {
  key: string;
  value: string;
  description?: string;
  category: string;
  updated_at: Date;
}

class ConfigurationService {
  private cache = new Map<string, { value: string; expires: number }>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  async getByKey(key: string): Promise<SystemConfiguration | null> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return { key, value: cached.value } as SystemConfiguration;
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('system_configuration')
      .select('*')
      .eq('key', key)
      .single();

    if (error || !data) return null;

    // Update cache
    this.cache.set(key, {
      value: data.value,
      expires: Date.now() + this.cacheTTL,
    });

    return data;
  }

  async setByKey(key: string, value: string): Promise<void> {
    await supabase
      .from('system_configuration')
      .upsert({ key, value, updated_at: new Date() });

    // Invalidate cache
    this.cache.delete(key);
  }
}
```

## Secrets vs Configurations

### Secrets (Environment Variables Only)

**Never store in database** - Use `.env.local` or platform secrets:

| Type | Examples |
|------|----------|
| API Keys | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` |
| Database | `DATABASE_URL`, `DIRECT_URL` |
| Auth | `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` |
| Third-party | `STRIPE_SECRET_KEY`, `SENDGRID_API_KEY` |

### Configurations (Database + Env Fallback)

**Safe to store in database** - Use `system_configuration` table:

| Type | Examples |
|------|----------|
| Model Settings | `OPENAI_MODEL`, `MAX_TOKENS`, `TEMPERATURE` |
| Feature Flags | `ENABLE_BETA_FEATURES`, `MAINTENANCE_MODE` |
| Rate Limits | `API_RATE_LIMIT`, `UPLOAD_SIZE_LIMIT` |
| URLs | `WEBHOOK_URL`, `CDN_BASE_URL` |
| Thresholds | `CACHE_TTL`, `SESSION_TIMEOUT` |

### Decision Flowchart

```
Is it sensitive if exposed?
├── YES → Environment variable only (.env.local)
│         Examples: API keys, passwords, tokens
│
└── NO → Database configuration with env fallback
         Examples: model names, feature flags, limits
```

## Vector Search Patterns

### Full Embeddings Approach

**Critical**: Always send full-dimension embeddings to database functions. The database handles dimension reduction internally.

```typescript
// CORRECT: Send full 3072D embeddings
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-large',
  input: query,
  dimensions: 3072,  // Full dimensions
});

const results = await supabase.rpc('match_documents', {
  query_embedding: embedding.data[0].embedding,  // Full 3072D
  match_threshold: 0.7,
  match_count: 10,
});

// INCORRECT: Don't truncate client-side
// const truncated = embedding.slice(0, 512);  // DON'T DO THIS
```

### Database Function (Two-Pass Retrieval)

```sql
-- The database function handles Matryoshka embedding optimization
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(3072),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- First pass: Fast filtering with 512D prefix
  WITH candidates AS (
    SELECT
      d.id,
      d.content,
      d.embedding,
      1 - (d.embedding_512 <=> query_embedding[1:512]) AS fast_similarity
    FROM documents d
    WHERE 1 - (d.embedding_512 <=> query_embedding[1:512]) > match_threshold - 0.1
    ORDER BY d.embedding_512 <=> query_embedding[1:512]
    LIMIT match_count * 3  -- Over-fetch for reranking
  )
  -- Second pass: Precise ranking with full 3072D
  SELECT
    c.id,
    c.content,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM candidates c
  WHERE 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Embedding Storage Schema

```sql
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  embedding vector(3072),       -- Full embeddings for precision
  embedding_512 vector(512),    -- Matryoshka prefix for fast filtering
  created_at timestamptz DEFAULT now()
);

-- Indexes for both dimensions
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
CREATE INDEX ON documents USING ivfflat (embedding_512 vector_cosine_ops)
  WITH (lists = 100);
```

### Embedding Generation

```typescript
async function generateEmbeddings(text: string) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
    dimensions: 3072,
  });

  const fullEmbedding = response.data[0].embedding;

  return {
    embedding: fullEmbedding,           // Full 3072D
    embedding_512: fullEmbedding.slice(0, 512),  // Matryoshka prefix
  };
}
```

## Row Level Security (RLS) Patterns

### Enable RLS on All Tables

```sql
-- Always enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner too (important for service role)
ALTER TABLE documents FORCE ROW LEVEL SECURITY;
```

### Common Policy Patterns

#### User-Owned Data

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);
```

#### Organization-Based Access

```sql
-- Users can access data from their organization
CREATE POLICY "Organization members can view"
  ON documents FOR SELECT
  USING (
    organization_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

#### Role-Based Access

```sql
-- Admins have full access
CREATE POLICY "Admins have full access"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

#### Public Read, Owner Write

```sql
-- Anyone can read, only owner can modify
CREATE POLICY "Public read access"
  ON documents FOR SELECT
  USING (is_public = true);

CREATE POLICY "Owner write access"
  ON documents FOR ALL
  USING (auth.uid() = user_id);
```

### Service Role Bypass

```typescript
// For server-side operations that need to bypass RLS
import { createClient } from '@supabase/supabase-js';

// This client bypasses RLS - use carefully!
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Regular client respects RLS
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

### RLS Testing

```sql
-- Test as a specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-here"}';

-- Run your query
SELECT * FROM documents;

-- Reset
RESET ROLE;
```

## Migration Best Practices

### Idempotent Migrations

```sql
-- Use IF NOT EXISTS / IF EXISTS
CREATE TABLE IF NOT EXISTS documents (...);
DROP TABLE IF EXISTS old_table;

-- Use DO blocks for conditional logic
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE documents ADD COLUMN metadata jsonb;
  END IF;
END $$;
```

### Safe Column Operations

```sql
-- Add columns with defaults (fast in PostgreSQL 11+)
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Rename columns safely
ALTER TABLE documents
RENAME COLUMN old_name TO new_name;

-- Change column type with explicit cast
ALTER TABLE documents
ALTER COLUMN count TYPE bigint USING count::bigint;
```

### Index Creation

```sql
-- Create indexes concurrently to avoid locking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_user_id
ON documents (user_id);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_user_status
ON documents (user_id, status)
WHERE status != 'deleted';
```

## Performance Optimization

### Connection Pooling

```typescript
// Use connection pooling in production
const connectionString = isProduction()
  ? process.env.DATABASE_URL      // Pooled connection (port 6543)
  : process.env.DIRECT_URL;       // Direct connection (port 5432)
```

### Query Optimization

```sql
-- Use EXPLAIN ANALYZE to check query plans
EXPLAIN ANALYZE
SELECT * FROM documents
WHERE user_id = 'uuid-here'
AND created_at > now() - interval '7 days';

-- Add indexes for frequently filtered columns
CREATE INDEX idx_documents_created_at ON documents (created_at DESC);
```

### Batch Operations

```typescript
// Batch inserts for better performance
const documents = [...]; // Array of documents

const { error } = await supabase
  .from('documents')
  .insert(documents);  // Single insert with array

// Use upsert for idempotent operations
const { error } = await supabase
  .from('documents')
  .upsert(documents, { onConflict: 'external_id' });
```
