# Tailwind CSS v4 Patterns

Modern Tailwind v4 configuration with CSS variables, @theme directive, and type-safe theming.

---

## Configuration

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS variable references
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        // Semantic colors
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },

        // Component colors
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },

        // Sidebar colors
        sidebar: {
          DEFAULT: 'var(--sidebar-background)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          accent: 'var(--sidebar-accent)',
        },

        // Brand colors with scales
        purple: {
          50: 'var(--purple-50)',
          100: 'var(--purple-100)',
          500: 'var(--purple-500)',
          900: 'var(--purple-900)',
        },
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--foreground)',
            '--tw-prose-headings': 'var(--foreground)',
            '--tw-prose-links': 'var(--primary)',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
```

---

## CSS Variables with @theme

### globals.css

```css
@import 'tailwindcss';
@config '../../tailwind.config.ts';

@theme {
  /* Custom Breakpoints */
  --breakpoint-xs: 475px;
  --breakpoint-3xl: 1920px;

  /* Brand Colors (static) */
  --color-brand-primary: hsl(262 83% 58%);
  --color-brand-secondary: hsl(179 50% 55%);
  --color-brand-accent: hsl(331 85% 45%);

  /* Border Radius */
  --radius: 0.5rem;
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);

  /* Animations - Keyframes */
  @keyframes accordion-down {
    from { height: 0; }
    to { height: var(--radix-accordion-content-height); }
  }

  @keyframes accordion-up {
    from { height: var(--radix-accordion-content-height); }
    to { height: 0; }
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Animation Utilities */
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
  --animate-shimmer: shimmer 800ms ease-in-out infinite;
  --animate-spin-slow: spin-slow 3s linear infinite;
}

/* Accessibility: Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  @theme {
    --animate-shimmer: none;
    --animate-spin-slow: none;
    --animate-accordion-down: none;
    --animate-accordion-up: none;
  }
}
```

---

## Theme Variables (Light/Dark)

```css
:root {
  /* Light theme */
  --background: hsl(0 0% 100%);
  --foreground: hsl(222 47% 11%);

  --card: hsl(0 0% 100%);
  --card-foreground: hsl(222 47% 11%);

  --primary: hsl(262 83% 58%);
  --primary-foreground: hsl(0 0% 100%);

  --secondary: hsl(210 40% 96%);
  --secondary-foreground: hsl(222 47% 11%);

  --muted: hsl(210 40% 96%);
  --muted-foreground: hsl(215 16% 47%);

  --accent: hsl(210 40% 96%);
  --accent-foreground: hsl(222 47% 11%);

  --destructive: hsl(0 84% 60%);
  --destructive-foreground: hsl(0 0% 100%);

  --border: hsl(214 32% 91%);
  --input: hsl(214 32% 91%);
  --ring: hsl(262 83% 58%);

  --radius: 0.5rem;

  /* Purple scale */
  --purple-50: hsl(270 100% 98%);
  --purple-100: hsl(269 100% 95%);
  --purple-500: hsl(262 83% 58%);
  --purple-900: hsl(263 70% 25%);
}

.dark {
  --background: hsl(222 47% 11%);
  --foreground: hsl(210 40% 98%);

  --card: hsl(222 47% 13%);
  --card-foreground: hsl(210 40% 98%);

  --primary: hsl(262 83% 68%);
  --primary-foreground: hsl(222 47% 11%);

  --secondary: hsl(217 33% 17%);
  --secondary-foreground: hsl(210 40% 98%);

  --muted: hsl(217 33% 17%);
  --muted-foreground: hsl(215 20% 65%);

  --accent: hsl(217 33% 17%);
  --accent-foreground: hsl(210 40% 98%);

  --destructive: hsl(0 62% 50%);
  --destructive-foreground: hsl(210 40% 98%);

  --border: hsl(217 33% 25%);
  --input: hsl(217 33% 25%);
  --ring: hsl(262 83% 68%);

  /* Purple scale (dark) */
  --purple-50: hsl(270 50% 15%);
  --purple-100: hsl(269 50% 20%);
  --purple-500: hsl(262 83% 68%);
  --purple-900: hsl(263 100% 90%);
}
```

---

## Component Utilities

### cn() Helper (tailwind-merge + clsx)

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### Usage

```tsx
<div className={cn(
  'rounded-lg border bg-card p-4',
  isActive && 'ring-2 ring-primary',
  className
)} />
```

---

## PostCSS Configuration

```javascript
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

---

## Package Dependencies

```json
{
  "dependencies": {
    "tailwind-merge": "^3.0.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "@tailwindcss/typography": "^0.5.0"
  }
}
```

---

## shadcn/ui Integration

### components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## Best Practices

1. **Use CSS variables** for dynamic theming
2. **HSL color format** for easy adjustments
3. **Semantic naming** (primary, secondary, muted)
4. **@theme directive** for v4 features
5. **Respect prefers-reduced-motion** for accessibility
6. **tailwind-merge** to handle class conflicts
7. **Mobile-first** responsive design (`sm:` `md:` `lg:`)
