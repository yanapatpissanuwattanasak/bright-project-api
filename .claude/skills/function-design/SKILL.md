# Skill: function-design

Guidelines for writing clean, concise, and publicly callable functions across all layers of the portfolio.

## Core rules

1. **One function, one job** — if you need "and" to describe what it does, split it
2. **Name is the contract** — the name must fully describe the return value or side effect; no comments needed
3. **Pure by default** — avoid side effects unless the function's name declares them (e.g. `saveSchedule`, `clearToken`)
4. **Explicit return type** — always annotate return types on exported functions
5. **No silent failures** — either throw, return a typed null/undefined, or handle the error explicitly

---

## Layer-by-layer conventions

### `src/lib/utils.ts` — pure utilities, no imports from the app

- Stateless transformations only: format, compute, convert
- No axios, no localStorage, no React
- Always return a value — never void

```ts
// Good
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { ... }).format(new Date(iso))
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

// Bad — does two things, mutates state
export function formatAndSave(iso: string): void {
  const formatted = formatDate(iso)
  localStorage.setItem('lastDate', formatted)
}
```

### `src/lib/api/*.ts` — async fetch functions, one per entity

- Each function fetches exactly one resource or collection
- Always unwrap the `ApiResponse<T>` envelope before returning
- Name pattern: `fetch<Entity>`, `create<Entity>`, `update<Entity>`, `delete<Entity>`

```ts
// Good
export async function fetchProjectBySlug(slug: string): Promise<Project> {
  const { data } = await apiClient.get<ApiResponse<Project>>(`/api/projects/${slug}`)
  return data.data
}

// Bad — two responsibilities, ambiguous name
export async function getProjectData(slug: string, featured?: boolean): Promise<Project | Project[]> {
  if (featured) { ... }
  ...
}
```

### `src/hooks/use*.ts` — TanStack Query wrappers, one hook per data need

- Each hook wraps exactly one query or mutation
- Always include the `USE_STATIC_DATA` toggle
- Return the raw `useQuery` / `useMutation` result — do not reshape inside the hook

```ts
// Good
export function useProjectBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(slug),
    queryFn: USE_STATIC_DATA
      ? () => STATIC_PROJECTS.find((p) => p.slug === slug) ?? null
      : () => fetchProjectBySlug(slug),
    enabled: Boolean(slug),
  })
}

// Bad — merges two data sources, hard to cache independently
export function useProjectWithTags(slug: string) {
  const project = useProjectBySlug(slug)
  const tags = useProjectTags()
  return { ...project, allTags: tags.data }
}
```

### `src/lib/timeblock.ts` — domain logic, pure + storage helpers

- Pure computations (no I/O): `snapToInterval`, `computeSummary`, `assignLanes`
- Storage helpers (explicit I/O): `loadSchedule`, `saveSchedule` — always try/catch, never throw to caller

```ts
// Good — pure, testable
export function computeSummary(schedule: DaySchedule): Summary { ... }

// Good — I/O declared by name, silent-fail on unavailable storage
export function saveSchedule(schedule: DaySchedule): void {
  try {
    ...
  } catch {
    // storage unavailable — silent fail
  }
}
```

---

## SOLID principles

### S — Single Responsibility
Every function or module has exactly one reason to change.

```ts
// Bad — fetches AND transforms AND saves
async function loadAndCacheProjects(): Promise<void> {
  const { data } = await apiClient.get('/api/projects')
  const formatted = data.map((p) => ({ ...p, publishedAt: formatDate(p.publishedAt) }))
  localStorage.setItem('projects', JSON.stringify(formatted))
}

// Good — each function owns one concern
export async function fetchPublishedProjects(): Promise<Project[]> {
  const { data } = await apiClient.get<ApiResponse<Project[]>>('/api/projects')
  return data.data
}
export function formatProject(p: Project): Project {
  return { ...p, publishedAt: formatDate(p.publishedAt) }
}
```

### O — Open / Closed
Functions should be open for extension but closed for modification.
Add behavior by composing or passing new arguments — not by editing existing logic.

```ts
// Bad — must edit function every time a new format is needed
export function formatDate(iso: string, mode: 'short' | 'long' | 'relative'): string {
  if (mode === 'short') { ... }
  if (mode === 'long') { ... }
  if (mode === 'relative') { ... }
}

// Good — extend by passing options, core logic untouched
export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(iso))
}
```

### L — Liskov Substitution
A function that accepts a type must work correctly with any valid subtype — no hidden shape assumptions.

```ts
// Bad — assumes tag always has a color field that exists
function renderTag(tag: Tag): string {
  return `<span style="color:${tag.color}">${tag.name}</span>`
}

// Good — handle missing optional fields explicitly
function renderTag(tag: Tag): string {
  const style = tag.color ? ` style="color:${tag.color}"` : ''
  return `<span${style}>${tag.name}</span>`
}
```

### I — Interface Segregation
Accept only what the function actually needs — no fat parameter objects.

```ts
// Bad — passes entire Project just to display the title
function renderProjectTitle(project: Project): string {
  return project.title
}

// Good — accept only what is used
function renderProjectTitle(title: string): string {
  return title
}

// Good — if multiple fields needed, use a narrow type
function renderProjectCard({ title, slug, summary }: Pick<Project, 'title' | 'slug' | 'summary'>) { ... }
```

### D — Dependency Inversion
High-level logic should not depend on concrete implementations — depend on abstractions or injected values.

```ts
// Bad — hook is hardwired to the static array
export function useFeaturedProjects() {
  return useQuery({
    queryKey: queryKeys.projects.featured(),
    queryFn: () => STATIC_PROJECTS.filter((p) => p.isFeatured),
  })
}

// Good — data source injected via the USE_STATIC_DATA toggle (abstracts the transport)
const USE_STATIC_DATA = !import.meta.env.VITE_API_BASE_URL

export function useFeaturedProjects() {
  return useQuery({
    queryKey: queryKeys.projects.featured(),
    queryFn: USE_STATIC_DATA
      ? () => STATIC_PROJECTS.filter((p) => p.isFeatured)
      : () => fetchFeaturedProjects(),
  })
}
```

---

## Cross-layer call direction

```
Page / Component
      ↓  calls
  Hook (use*.ts)
      ↓  calls
  API fn (lib/api/*.ts)  ←→  Utils (lib/utils.ts)
      ↓  calls
  apiClient (lib/api/client.ts)
```

- Never call a hook from another hook's `queryFn`
- Never import a page or component into a utility or API file
- `lib/utils.ts` has no dependencies on any other `src/` module

---

## Function signature checklist

Before writing a new function, verify:

- [ ] Name uses camelCase and fully describes what it returns or does
- [ ] Single responsibility — one job only
- [ ] Return type is explicitly annotated
- [ ] Parameters are typed (no `any`)
- [ ] Side effects are either absent or declared by the name
- [ ] Error handling is explicit (try/catch or `enabled` guard) — no silent undefined returns on failure
