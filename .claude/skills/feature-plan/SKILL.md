# Skill: feature-plan

Analyze acceptance criteria from a `reqFeature/` document against the current project structure, then produce a concrete, file-level implementation work plan.

## When to use

Invoke with `/feature-plan` when the user wants to:
- Turn a requirement doc into an actionable task list
- Check which acceptance criteria are already met vs. still pending
- Get a step-by-step build order before starting a new feature

---

## Execution steps

### 1 — Read the requirement

- List all files under `reqFeature/` and ask the user which one to analyze (or use the one they name)
- Read the full document; extract:
  - **Acceptance criteria** (the `- [ ] / - [x]` checklist)
  - **Data models** (types, interfaces)
  - **API contract** (endpoints, params, response shape)
  - **UI components** (names, paths, props, states)
  - **Dependencies** (packages listed)

### 2 — Audit the project structure

Cross-reference each requirement item against the actual codebase:

| Area | Where to look |
|---|---|
| Routes | `src/constants/routes.ts`, `src/App.tsx` |
| Pages | `src/pages/` |
| Components | `src/components/<feature>/` |
| Hooks | `src/hooks/` |
| API functions | `src/lib/api/` |
| Types | `src/types/` |
| Static data | `src/data/` |
| Query keys | `src/constants/queryKeys.ts` |
| Packages | `package.json` |
| Env vars | `.env.example` |
| Proxy / infra | `vite.config.ts`, `nginx.conf`, `Dockerfile` |

For each acceptance criterion, determine:
- ✅ **Done** — file exists and the criterion is implemented correctly
- ⚠️ **Partial** — file exists but the implementation is incomplete or wrong
- ❌ **Missing** — nothing exists yet

### 3 — Produce the work plan

Output a structured plan with these sections:

#### Status summary table

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Map renders all province boundaries | ✅ Done | `ThailandMap.tsx` |
| 2 | Category filter re-fetches with keyword | ⚠️ Partial | keyword param missing |
| 3 | CORS proxy configured | ❌ Missing | need Vite + Nginx |

#### Ordered task list

Group tasks by dependency order (infra → types → data → API → hooks → components → pages → tests). For each task:

```
[ ] Task title
    File: src/path/to/file.tsx
    Change: one-sentence description of exactly what to add/modify
    Depends on: #task-number (if any)
```

#### Package installs (if any)

```bash
npm install <package> --legacy-peer-deps
```

#### Env vars to add (if any)

List any new variables to add to `.env.example` and `Dockerfile`.

---

## Output rules

- Be concrete: every task must name the exact file and the change required
- No vague tasks like "implement the API" — break it into: type, fetch function, hook, component
- Mark the critical path (tasks that block others) with 🔑
- If a criterion is already ✅, skip it in the task list — do not re-implement working code
- List package installs before any code tasks that need them
- End with an estimated task count and the suggested implementation order

---

## Example output format

```
## Feature: Thailand Map

### Status (12 criteria)
✅ 8 done  ⚠️ 2 partial  ❌ 2 missing

### Status Table
| # | Criterion | Status | Notes |
...

### Work Plan (4 tasks)

🔑 [ ] 1. Add VITE_TAT_API_KEY to .env.example and Dockerfile
        File: .env.example, Dockerfile
        Change: add VITE_TAT_API_KEY= placeholder and ARG/ENV declaration

[ ] 2. Add tatId field to Province type
        File: src/types/thailand.types.ts
        Change: add `tatId: number` to Province interface
        Depends on: #1

[ ] 3. Populate tatId in PROVINCES data
        File: src/data/thailand.ts
        Change: add TAT numeric province ID to each Province entry
        Depends on: #2

[ ] 4. Rewrite fetchAttractionsByProvince to use TAT API
        File: src/lib/api/thailand.ts
        Change: replace Foursquare base URL, headers, and params with TAT equivalents

### Suggested order
1 → 2 → 3 → 4
```
