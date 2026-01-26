# Data Fetching Patterns

React data fetching patterns with proper AbortController cleanup for Next.js.

---

## useFetch Hook Pattern

One-time fetch with automatic abort on unmount:

```typescript
// hooks/useFetch.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFetchOptions<T> {
  url: string;
  options?: RequestInit;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>({
  url,
  options,
  onSuccess,
  onError,
  enabled = true,
}: UseFetchOptions<T>): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Abort any in-flight request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      if (isAbortError(err)) {
        // Silently ignore abort errors
        return;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [url, options, onSuccess, onError]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [enabled, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
```

**Usage**:

```typescript
function UserList() {
  const { data: users, isLoading, error, refetch } = useFetch<User[]>({
    url: '/api/users',
    onSuccess: (users) => console.log(`Fetched ${users.length} users`),
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {users?.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
}
```

---

## usePolling Hook Pattern

Polling with visibility-aware intervals and error backoff:

```typescript
// hooks/usePolling.ts
import { useState, useEffect, useCallback, useRef } from 'react';

type PollingTier = 'FAST' | 'MEDIUM' | 'SLOW';

const POLLING_INTERVALS: Record<PollingTier, number> = {
  FAST: 10_000,    // 10 seconds
  MEDIUM: 30_000,  // 30 seconds
  SLOW: 60_000,    // 60 seconds
};

interface UsePollingOptions<T> {
  tier: PollingTier;
  fetcher: (signal: AbortSignal) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface UsePollingResult<T> {
  data: T | null;
  error: Error | null;
  isFetching: boolean;
  refresh: () => Promise<void>;
}

export function usePolling<T>({
  tier,
  fetcher,
  onSuccess,
  onError,
  enabled = true,
}: UsePollingOptions<T>): UsePollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const errorCountRef = useRef(0);

  const poll = useCallback(async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsFetching(true);

    try {
      const result = await fetcher(abortControllerRef.current.signal);
      setData(result);
      setError(null);
      errorCountRef.current = 0;
      onSuccess?.(result);
    } catch (err) {
      if (isAbortError(err)) return;

      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      errorCountRef.current++;
      onError?.(error);
    } finally {
      setIsFetching(false);
    }
  }, [fetcher, onSuccess, onError]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    poll();

    // Set up polling interval with exponential backoff on errors
    const baseInterval = POLLING_INTERVALS[tier];

    const scheduleNext = () => {
      const backoff = Math.min(errorCountRef.current, 5);
      const interval = baseInterval * Math.pow(2, backoff);

      intervalRef.current = setTimeout(() => {
        if (document.visibilityState === 'visible') {
          poll().then(scheduleNext);
        } else {
          scheduleNext();
        }
      }, interval);
    };

    scheduleNext();

    return () => {
      abortControllerRef.current?.abort();
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [enabled, tier, poll]);

  return { data, error, isFetching, refresh: poll };
}
```

**Usage**:

```typescript
function HealthDashboard() {
  const { data: health, isFetching, refresh } = usePolling<HealthResponse>({
    tier: 'FAST',
    fetcher: async (signal) => {
      const res = await fetch('/api/health', { signal });
      if (!res.ok) throw new Error('Health check failed');
      return res.json();
    },
  });

  return (
    <Card>
      <Status status={health?.status} loading={isFetching} />
      <Button onClick={refresh}>Check Now</Button>
    </Card>
  );
}
```

---

## AbortController Usage

Always use AbortController for cancellable requests:

```typescript
// Manual pattern for custom useEffect
useEffect(() => {
  const controller = new AbortController();
  const { signal } = controller;

  async function loadData() {
    try {
      const res = await fetch('/api/data', { signal });
      const data = await res.json();
      setData(data);
    } catch (err) {
      if (!isAbortError(err)) {
        setError(err as Error);
      }
    }
  }

  loadData();

  return () => controller.abort();
}, []);
```

---

## isAbortError Helper

Always check for abort errors to prevent false error states:

```typescript
// lib/abort.ts
export function isAbortError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'AbortError' ||
      error.message.includes('aborted') ||
      error.message.includes('signal')
    );
  }
  return false;
}

// Usage
try {
  await fetch(url, { signal });
} catch (err) {
  if (isAbortError(err)) {
    // Request was cancelled, ignore
    return;
  }
  // Handle real errors
  throw err;
}
```

---

## Signal Propagation

Pass signals through all async layers:

```typescript
// Service layer
async function fetchUserData(
  userId: string,
  signal?: AbortSignal
): Promise<UserData> {
  const [profile, preferences] = await Promise.all([
    fetchProfile(userId, signal),
    fetchPreferences(userId, signal),
  ]);

  return { profile, preferences };
}

async function fetchProfile(
  userId: string,
  signal?: AbortSignal
): Promise<Profile> {
  const res = await fetch(`/api/users/${userId}/profile`, { signal });
  return res.json();
}

async function fetchPreferences(
  userId: string,
  signal?: AbortSignal
): Promise<Preferences> {
  const res = await fetch(`/api/users/${userId}/preferences`, { signal });
  return res.json();
}

// Component
function UserProfile({ userId }: { userId: string }) {
  const [data, setData] = useState<UserData | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchUserData(userId, controller.signal)
      .then(setData)
      .catch(err => {
        if (!isAbortError(err)) console.error(err);
      });

    return () => controller.abort();
  }, [userId]);

  return <ProfileView data={data} />;
}
```

---

## Memoization Requirements

Memoize fetch options to prevent unnecessary refetches:

```typescript
function DataTable({ filters }: { filters: Filters }) {
  // BAD - new object on every render causes infinite loop
  const { data } = useFetch({
    url: '/api/data',
    options: {
      method: 'POST',
      body: JSON.stringify(filters),
    },
  });

  // GOOD - memoize the options object
  const fetchOptions = useMemo(
    () => ({
      method: 'POST' as const,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    }),
    [filters]
  );

  const { data } = useFetch({
    url: '/api/data',
    options: fetchOptions,
  });

  return <Table data={data} />;
}
```

**Memoize fetcher functions for usePolling**:

```typescript
function Dashboard({ endpoint }: { endpoint: string }) {
  // Memoize the fetcher to prevent re-subscriptions
  const fetcher = useCallback(
    async (signal: AbortSignal) => {
      const res = await fetch(endpoint, { signal });
      return res.json();
    },
    [endpoint]
  );

  const { data } = usePolling({
    tier: 'MEDIUM',
    fetcher,
  });

  return <Stats data={data} />;
}
```

---

## createAbortController Helper

Utility for cleaner abort handling:

```typescript
// lib/abort.ts
export function createAbortController() {
  const controller = new AbortController();

  return {
    signal: controller.signal,
    abort: () => controller.abort(),
    isCancelled: () => controller.signal.aborted,
  };
}

// Usage
useEffect(() => {
  const { signal, abort, isCancelled } = createAbortController();

  fetchData(signal).then(data => {
    if (!isCancelled()) {
      setData(data);
    }
  });

  return abort;
}, []);
```

---

## Best Practices

1. **Always pass signal** to fetch calls
2. **Use isAbortError** to silently ignore abort errors
3. **Memoize options** with `useMemo` to prevent refetches
4. **Memoize fetchers** with `useCallback` for polling hooks
5. **Propagate signals** through all async layers
6. **Prefer usePolling** for admin dashboards and monitoring
7. **Clean up** abort controllers in useEffect return
8. **Check isCancelled** before updating state after async operations
