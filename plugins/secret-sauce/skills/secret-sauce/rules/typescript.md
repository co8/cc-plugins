# TypeScript Strict Rules

> Detailed patterns: `references/coding-standards.md`

## Compiler Settings

- [ ] `strict: true` in tsconfig.json
- [ ] `noImplicitAny: true`
- [ ] `strictNullChecks: true`
- [ ] `noUnusedLocals: true`
- [ ] `noUnusedParameters: true`
- [ ] `noImplicitReturns: true`

## Type Safety

- [ ] No `any` types - use `unknown` for truly unknown types
- [ ] Explicit return types on all exported functions
- [ ] Use strict type guards for narrowing
- [ ] Prefer `interface` over `type` for object shapes
- [ ] Use `as const` for literal inference

## Null Handling

- [ ] Use optional chaining (`?.`) for nullable access
- [ ] Use nullish coalescing (`??`) over logical OR
- [ ] Avoid non-null assertions (`!`) unless certain
- [ ] Handle all `null | undefined` cases explicitly

## Best Practices

- [ ] Use `readonly` for immutable properties
- [ ] Prefer `unknown` over `any` for catch blocks
- [ ] Use discriminated unions for state machines
- [ ] Export types alongside implementations
- [ ] Use branded types for domain primitives

## Common Patterns

```typescript
// Strict function signature
export function processData(input: InputType): ResultType {
  // ...
}

// Type guard
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}

// Branded type
type UserId = string & { readonly brand: unique symbol };
```
