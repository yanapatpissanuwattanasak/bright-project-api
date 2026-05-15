# Skill: naming-convention

กฎการตั้งชื่อตัวแปร, function, และ type ในโปรเจกต์นี้

## กฎหลัก

**ตัวแปรและ function ทุกตัวต้องใช้ camelCase และต้องสื่อความหมายชัดเจน**

- ห้ามใช้ชื่อย่อที่คลุมเครือ เช่น `d`, `tmp`, `val`, `x`, `data2`
- ชื่อต้องบอกได้ว่าเก็บอะไร หรือทำอะไร โดยไม่ต้องอ่าน comment

## รูปแบบตาม context

| ประเภท | รูปแบบ | ตัวอย่าง |
|---|---|---|
| ตัวแปรทั่วไป | camelCase | `projectList`, `isLoading`, `selectedTag` |
| function | camelCase กริยานำ | `fetchProjects`, `handleSubmit`, `formatDate` |
| React component | PascalCase | `ProjectCard`, `HeroSection` |
| Type / Interface | PascalCase | `ProjectFilters`, `CaseStudySection` |
| Constant (module-level) | SCREAMING_SNAKE_CASE | `STATIC_PROJECTS`, `USE_STATIC_DATA` |
| CSS class (Tailwind) | kebab-case | ใช้ utility class ตามปกติ |

## ตัวอย่าง — ถูก vs ผิด

```ts
// ผิด
const d = await fetchProjects()
const tmp = project.tags.filter(t => t.slug === slug)
let val = 0

// ถูก
const publishedProjects = await fetchProjects()
const matchingTags = project.tags.filter((tag) => tag.slug === slug)
let retryCount = 0
```

```ts
// ผิด
function fn(p: Project) { ... }
const x = useQuery(...)

// ถูก
function formatProjectSlug(project: Project) { ... }
const projectQuery = useQuery(...)
```

## Boolean ต้องขึ้นต้นด้วย is / has / can / should

```ts
// ผิด
const loading = true
const auth = false
const modal = true

// ถูก
const isLoading = true
const isAuthenticated = false
const isModalOpen = true
const hasPublishedProjects = false
const canSubmit = true
```

## Array ต้องเป็นพหูพจน์

```ts
// ผิด
const tag = project.tags
const projectItem = []

// ถูก
const tags = project.tags
const projectItems = []
```
