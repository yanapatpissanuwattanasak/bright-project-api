import { ProjectStatus } from '../value-objects/project-status.vo'

export interface ProjectMetric {
  label: string
  value: string
}

export class Project {
  constructor(
    readonly id: string,
    public title: string,
    public slug: string,
    public summary: string,
    public problem: string,
    public solution: string,
    public techStack: string[],
    public metrics: ProjectMetric[],
    public sortOrder: number,
    public isFeatured: boolean,
    public status: ProjectStatus,
    public loomUrl: string | null,
    public demoUrl: string | null,
    public githubUrl: string | null,
    public thumbnailUrl: string | null,
    public publishedAt: Date | null,
    readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  canPublish(): { ok: true } | { ok: false; missing: string[] } {
    const missing: string[] = []
    if (!this.slug) missing.push('slug')
    if (!this.summary) missing.push('summary')
    if (!this.techStack.length) missing.push('techStack')
    return missing.length ? { ok: false, missing } : { ok: true }
  }

  publish(): void {
    const check = this.canPublish()
    if (!check.ok) throw new Error(`Cannot publish: missing ${check.missing.join(', ')}`)
    this.status = ProjectStatus.PUBLISHED
    if (!this.publishedAt) this.publishedAt = new Date()
    this.updatedAt = new Date()
  }

  unpublish(): void {
    this.status = ProjectStatus.DRAFT
    this.updatedAt = new Date()
  }

  archive(): void {
    this.status = ProjectStatus.ARCHIVED
    this.updatedAt = new Date()
  }

  isPublished(): boolean {
    return this.status === ProjectStatus.PUBLISHED
  }
}
