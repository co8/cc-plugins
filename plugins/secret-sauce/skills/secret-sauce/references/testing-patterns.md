# Testing Patterns

Reference guide for testing standards, configuration, and best practices.

---

## Jest Configuration

### Basic Setup

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

### Timeout Settings

Configure appropriate timeouts for different test types:

```javascript
// jest.config.js
module.exports = {
  // Default timeout
  testTimeout: 10000,  // 10 seconds

  // For specific test files, override in the file
};
```

```typescript
// For ML operations or long-running tests
// At top of test file or in describe block
jest.setTimeout(30000);  // 30 seconds for ML operations

describe('ML Flow Tests', () => {
  beforeAll(() => {
    jest.setTimeout(30000);
  });

  // tests...
});
```

**Timeout Guidelines**:

| Test Type | Timeout |
|-----------|---------|
| Unit tests | 5s (default) |
| Integration tests | 15s |
| API tests | 20s |
| ML/AI operations | 30s |
| E2E tests | 60s |

---

## Coverage Targets

**Minimum Coverage**: >90% for all metrics

```javascript
coverageThreshold: {
  global: {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

### Running Coverage

```bash
# Generate coverage report
npm run test:coverage

# With specific directory
npm run test:coverage -- --collectCoverageFrom='src/services/**/*.ts'

# HTML report
npm run test:coverage -- --coverageReporters='html'
```

### Coverage Best Practices

- Focus on meaningful tests, not just hitting numbers
- Test edge cases and error paths
- Don't exclude files without justification
- Review uncovered lines during code review

---

## Test Integration Policy

**Critical**: All new test directories MUST be added to the batched test runner.

### Adding New Test Directories

When creating new test files or directories:

1. Add to `scripts/testing/batched-test-runner.sh`
2. Update test configuration if needed
3. Verify tests run in CI pipeline

```bash
# Example batched-test-runner.sh structure
#!/bin/bash

TEST_DIRS=(
  "src/tests/unit"
  "src/tests/integration"
  "src/tests/api"
  "tests/services"
  "tests/components"
  # Add new directories here
)

for dir in "${TEST_DIRS[@]}"; do
  echo "Running tests in $dir..."
  npm run test -- "$dir"
done
```

### Test Organization

```
project/
├── src/
│   └── tests/           # Co-located unit tests
│       ├── unit/
│       ├── integration/
│       └── api/
├── tests/               # Standalone test suites
│   ├── services/
│   ├── components/
│   └── e2e/
└── scripts/
    └── testing/
        └── batched-test-runner.sh
```

---

## Security Testing

### Snyk Integration

Run security scans regularly:

```bash
# Full security audit
npm run snyk:test

# Test specific packages
npx snyk test --severity-threshold=high

# Monitor for new vulnerabilities
npx snyk monitor
```

### Security Test Patterns

```typescript
describe('Security Tests', () => {
  describe('Input Validation', () => {
    it('should reject SQL injection attempts', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      expect(() => validateInput(maliciousInput)).toThrow();
    });

    it('should sanitize XSS payloads', () => {
      const xssPayload = '<script>alert("xss")</script>';
      const result = sanitize(xssPayload);
      expect(result).not.toContain('<script>');
    });
  });

  describe('Authentication', () => {
    it('should reject invalid tokens', async () => {
      const invalidToken = 'invalid.jwt.token';
      await expect(validateToken(invalidToken)).rejects.toThrow();
    });

    it('should handle expired tokens', async () => {
      const expiredToken = generateExpiredToken();
      await expect(validateToken(expiredToken)).rejects.toThrow('Token expired');
    });
  });

  describe('Authorization', () => {
    it('should prevent unauthorized access', async () => {
      const result = await accessProtectedResource({ role: 'guest' });
      expect(result.status).toBe(403);
    });
  });
});
```

---

## Test Structure

### Unit Test Pattern

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MyService } from '@/services/my-service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should handle success case', async () => {
      const result = await service.methodName(validInput);
      expect(result).toBeDefined();
      expect(result.status).toBe('success');
    });

    it('should handle error case', async () => {
      await expect(service.methodName(invalidInput))
        .rejects.toThrow('Expected error message');
    });

    it('should handle edge case', async () => {
      const result = await service.methodName(edgeCaseInput);
      expect(result).toMatchObject({ /* expected shape */ });
    });
  });
});
```

### Integration Test Pattern

```typescript
describe('API Integration', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should create and retrieve resource', async () => {
    // Create
    const createResponse = await api.post('/resource', testData);
    expect(createResponse.status).toBe(201);

    const id = createResponse.data.id;

    // Retrieve
    const getResponse = await api.get(`/resource/${id}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.data).toMatchObject(testData);
  });
});
```

---

## Common Commands

```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch

# Run specific test file
npm run test -- path/to/test.ts

# Run tests matching pattern
npm run test -- --testNamePattern="should handle"

# Coverage report
npm run test:coverage

# Integration tests only
npm run test:integration

# Security tests
npm run test:security:full
npm run snyk:test
```

---

## Mocking Best Practices

```typescript
// Mock external services
jest.mock('@/services/external-api', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'mocked' })
}));

// Mock with implementation
jest.mock('@/lib/database', () => ({
  query: jest.fn().mockImplementation((sql) => {
    if (sql.includes('SELECT')) return Promise.resolve([]);
    return Promise.resolve({ affectedRows: 1 });
  })
}));

// Spy on methods
const spy = jest.spyOn(service, 'methodName');
await service.doSomething();
expect(spy).toHaveBeenCalledWith(expectedArgs);

// Reset between tests
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
```
