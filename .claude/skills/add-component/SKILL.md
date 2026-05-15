# Skill: add-component

Add a new React component to the bright-portfolio following project conventions.

## When to use

Invoke with `/add-component` when the user wants to add a reusable component.

## Component placement

| Type | Location |
|---|---|
| Generic UI (Button, Badge, etc.) | `src/components/ui/` |
| Home page features | `src/components/home/` |
| Project-related | `src/components/projects/` |
| Case study display | `src/components/case-study/` |
| Contact form | `src/components/contact/` |
| Time-blocking tool | `src/components/timeblocking/` |
| Page layouts | `src/components/layout/` |

## Conventions

- Named exports only (no default exports from component files)
- Props type defined inline or in the same file — no separate props files
- Tailwind only — no inline styles or CSS modules
- Dark mode first: design in dark, add `dark:` for light overrides

### Animation rules (ADR-003)

- Hover / micro-interactions → **CSS `transition` only**, never Framer Motion
- Scroll reveal → use `<ScrollReveal>` wrapper (already configured with `useInView + once: true`)
- Page-level entry → use `<PageTransition>` (Framer Motion AnimatePresence)
- Always guard with `useReducedMotion()` — disable all variants when true

## Skeleton

```tsx
// src/components/ui/MyWidget.tsx
interface MyWidgetProps {
  title: string
  className?: string
}

export function MyWidget({ title, className }: MyWidgetProps) {
  return (
    <div className={`rounded-lg bg-zinc-900 p-4 ${className ?? ''}`}>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
  )
}
```

## Existing shared UI components

| Component | Path | Purpose |
|---|---|---|
| `<Button>` | `src/components/ui/Button.tsx` | Primary / ghost / outline variants |
| `<Badge>` | `src/components/ui/Badge.tsx` | Tag / status chips |
| `<Skeleton>` | `src/components/ui/Skeleton.tsx` | Loading placeholder |
| `<PageTransition>` | `src/components/ui/PageTransition.tsx` | Page entry animation |
| `<ScrollReveal>` | `src/components/ui/ScrollReveal.tsx` | Scroll-triggered reveal |
| `<ThemeToggle>` | `src/components/ui/ThemeToggle.tsx` | Dark/light toggle |
