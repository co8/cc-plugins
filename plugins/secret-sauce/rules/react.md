# React Component Patterns

## Components

- [ ] Functional components only (no class components)
- [ ] Use TypeScript for all components
- [ ] Define explicit prop types with interfaces
- [ ] Use `React.FC` sparingly (prefer explicit return types)
- [ ] Colocate related files (component, styles, tests)

## Hooks

- [ ] Follow Rules of Hooks
- [ ] Extract reusable logic into custom hooks
- [ ] Prefix custom hooks with `use`
- [ ] Use `useCallback` for stable function references
- [ ] Use `useMemo` for expensive computations

## State Management

- [ ] Zustand for global client state
- [ ] React Query (TanStack Query) for server state
- [ ] Keep state as local as possible
- [ ] Lift state only when necessary
- [ ] Use context sparingly

## UI Components

- [ ] shadcn/ui as component foundation
- [ ] Radix UI for accessible primitives
- [ ] Compose over configure
- [ ] Use `cn()` utility for class merging
- [ ] Follow compound component patterns

## Responsive Design

- [ ] Mobile-first approach
- [ ] Use Tailwind breakpoints (`sm:`, `md:`, `lg:`)
- [ ] Test on multiple viewports
- [ ] Avoid fixed widths
- [ ] Use container queries when appropriate

## Accessibility (WCAG)

- [ ] Semantic HTML elements
- [ ] Proper heading hierarchy
- [ ] ARIA labels where needed
- [ ] Keyboard navigation support
- [ ] Focus management
- [ ] Color contrast compliance
- [ ] Screen reader testing

## Common Patterns

```typescript
// Component with typed props
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button className={cn(variants[variant])} onClick={onClick}>
      {children}
    </button>
  );
}

// Custom hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```
