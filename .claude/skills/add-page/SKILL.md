# Skill: add-page

Add a new page to the bright-portfolio React SPA following existing conventions.

## When to use

Invoke with `/add-page` when the user wants to add a new route/page to the portfolio.

## Project conventions to follow

### Route tiers (defined in `App.tsx`)

| Tier | Layout | Example |
|---|---|---|
| Public | `<RootLayout>` (nav + footer) | `/about`, `/contact` |
| Standalone | No layout | `/time-blocking`, `/tarot` |
| Admin | `<AdminLayout>` + `<RequireAuth>` | `/admin/*` |

### Step-by-step

1. **Add the route constant** in `src/constants/routes.ts`
   ```ts
   export const ROUTES = {
     ...
     MY_PAGE: '/my-page',
   }
   ```

2. **Create the page component** in `src/pages/MyPage.tsx`
   - Use `<PageTransition>` as the root wrapper for animated entry
   - Use `<ScrollReveal>` for below-the-fold sections
   - Framer Motion is allowed **only** for page transitions (opacity + y: 16px → 0, 250ms) and scroll reveal (once: true, 80ms stagger). All hover interactions must use CSS `transition`.

3. **Register the route** in `src/App.tsx`
   - Public page → add inside the `<Route element={<RootLayout />}>` block
   - Standalone → add as a sibling `<Route>` outside any layout

4. **Data fetching** (if needed)
   - Create a hook in `src/hooks/use<Entity>.ts` using `useQuery` from TanStack Query v5
   - Add the query key to `src/constants/queryKeys.ts`
   - Add a `USE_STATIC_DATA` toggle at the top of the hook:
     ```ts
     const USE_STATIC_DATA = !import.meta.env.VITE_API_BASE_URL
     ```
   - Add the API fetch function in `src/lib/api/<entity>.ts`

### Theming rules (ADR-004)

- Dark mode is primary; design tokens are dark-first
- Use `dark:` prefix for light overrides
- `localStorage` preference beats `prefers-color-scheme`

### Animation budget (ADR-003)

- Page entry: `opacity + y: 16px → 0`, 250ms, via `<AnimatePresence>`
- Scroll reveal: `useInView + once: true`, 80ms stagger
- Always add `useReducedMotion()` guard to disable all variants

### Component location

| What | Where |
|---|---|
| Page | `src/pages/` |
| Shared UI | `src/components/ui/` |
| Feature components | `src/components/<feature>/` |
| Layout | `src/components/layout/` |

## Example skeleton

```tsx
// src/pages/MyPage.tsx
import { PageTransition } from '@/components/ui/PageTransition'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export default function MyPage() {
  return (
    <PageTransition>
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold">Title</h1>
      </section>
      <ScrollReveal>
        {/* below-fold content */}
      </ScrollReveal>
    </PageTransition>
  )
}
```
