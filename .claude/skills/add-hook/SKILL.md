# Skill: add-hook

Add a new TanStack Query data hook to the bright-portfolio, following the static/API dual-mode pattern.

## When to use

Invoke with `/add-hook` when the user wants to add a new data fetching hook.

## Pattern

Every hook must support two modes controlled by a single env flag:

```ts
// src/hooks/useMyEntity.ts
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { fetchMyEntity } from '@/lib/api/myEntity'
import { STATIC_MY_ENTITY } from '@/data/myEntity'

const USE_STATIC_DATA = !import.meta.env.VITE_API_BASE_URL

export function useMyEntity(id?: string) {
  return useQuery({
    queryKey: queryKeys.myEntity.detail(id),
    queryFn: USE_STATIC_DATA
      ? () => STATIC_MY_ENTITY.find((e) => e.id === id) ?? null
      : () => fetchMyEntity(id),
  })
}
```

## Steps

1. **Query key** — add to `src/constants/queryKeys.ts`
   ```ts
   myEntity: {
     all: ['myEntity'] as const,
     detail: (id?: string) => ['myEntity', id] as const,
   }
   ```

2. **API function** — add to `src/lib/api/myEntity.ts`
   ```ts
   import { apiClient } from './client'
   export const fetchMyEntity = (id?: string) =>
     apiClient.get<MyEntity>(`/my-entity/${id}`).then((r) => r.data)
   ```

3. **Static data** — add to `src/data/myEntity.ts`
   ```ts
   export const STATIC_MY_ENTITY: MyEntity[] = [ ... ]
   ```

4. **Type** — define in `src/types/myEntity.types.ts`

## Global query config (already set in `src/lib/queryClient.ts`)

- `staleTime: 5min`
- `gcTime: 10min`
- `refetchOnWindowFocus: false`

No need to override these per-hook unless explicitly required.
