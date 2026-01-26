# Coding Standards

Core coding patterns and best practices for TypeScript development.

---

## TypeScript Strict Mode

Enable strict mode in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

---

## No `any` Types Policy

Never use `any` types. Always define explicit types.

```typescript
// BAD - avoid any
function processData(data: any): any {
  return data.value;
}

// GOOD - explicit types
interface DataInput {
  value: string;
  count: number;
}

interface DataOutput {
  result: string;
  processed: boolean;
}

function processData(data: DataInput): DataOutput {
  return {
    result: data.value,
    processed: true,
  };
}
```

**When you truly don't know the type**, use `unknown` and validate:

```typescript
function parseJson(input: string): unknown {
  return JSON.parse(input);
}

// Then validate with Zod or type guards
const result = parseJson(rawInput);
const validated = MySchema.parse(result);
```

---

## Safe Property Access

Use `Object.prototype.hasOwnProperty.call()` for safe property checks:

```typescript
// BAD - prototype pollution risk
if (obj.hasOwnProperty('key')) { ... }
if (obj['key']) { ... }

// GOOD - safe property access
if (Object.prototype.hasOwnProperty.call(obj, 'key')) {
  const value = obj.key;
}

// GOOD - with type narrowing
function hasKey<K extends string>(
  obj: object,
  key: K
): obj is Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

if (hasKey(config, 'apiKey')) {
  console.log(config.apiKey);
}
```

---

## Input Validation with Zod

Validate all external inputs at system boundaries:

```typescript
import { z } from 'zod';

// Define schemas
const UserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().positive().optional(),
});

type UserInput = z.infer<typeof UserInputSchema>;

// Validate at boundaries
function createUser(rawInput: unknown): User {
  const input = UserInputSchema.parse(rawInput);
  // input is now typed as UserInput
  return { ...input, id: generateId() };
}

// Safe parse for error handling
function handleUserInput(rawInput: unknown): Result<UserInput> {
  const result = UserInputSchema.safeParse(rawInput);

  if (!result.success) {
    return {
      ok: false,
      error: result.error.flatten()
    };
  }

  return { ok: true, data: result.data };
}
```

**Coercion for form data**:

```typescript
const FormSchema = z.object({
  count: z.coerce.number().int().positive(),
  enabled: z.coerce.boolean(),
  date: z.coerce.date(),
});
```

---

## Error Handling Patterns

**Use Result types for expected failures**:

```typescript
type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await db.users.findById(id);
    if (!user) {
      return { ok: false, error: new Error('User not found') };
    }
    return { ok: true, data: user };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}

// Usage
const result = await fetchUser(id);
if (!result.ok) {
  console.error(result.error.message);
  return;
}
console.log(result.data.name);
```

**Throw for programmer errors**:

```typescript
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}
```

**Custom error classes for domain errors**:

```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}
```

---

## Code Organization

**File structure**:

```
src/
├── types/           # Type definitions
│   └── user.ts
├── schemas/         # Zod schemas
│   └── user.schema.ts
├── services/        # Business logic
│   └── user-service.ts
├── lib/             # Utilities
│   └── errors.ts
└── app/             # Entry points (routes, handlers)
    └── api/
```

**Export patterns**:

```typescript
// types/user.ts - Named exports for types
export interface User {
  id: string;
  email: string;
}

export type UserRole = 'admin' | 'user' | 'guest';

// services/user-service.ts - Class or function exports
export class UserService {
  async findById(id: string): Promise<User | null> { ... }
}

// Or functional approach
export function createUserService(db: Database) {
  return {
    findById: (id: string) => db.users.findById(id),
  };
}
```

**Import order**:

```typescript
// 1. Node.js built-ins
import { readFile } from 'fs/promises';

// 2. External packages
import { z } from 'zod';
import OpenAI from 'openai';

// 3. Internal absolute imports
import { UserService } from '@/services/user-service';
import type { User } from '@/types/user';

// 4. Relative imports
import { validateInput } from './utils';
```

---

## Additional Guidelines

- **Single responsibility**: Each function/class does one thing well
- **Explicit over implicit**: Prefer verbose clarity over clever brevity
- **Fail fast**: Validate inputs early, return errors immediately
- **Immutability**: Prefer `const`, spread operators, and pure functions
- **No magic strings**: Use constants or enums for repeated values

```typescript
// BAD
if (user.role === 'admin') { ... }

// GOOD
const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

if (user.role === ROLES.ADMIN) { ... }
```
