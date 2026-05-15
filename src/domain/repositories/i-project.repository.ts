import { Project } from '../entities/project.entity'

export interface ProjectFilters {
  tagSlug?: string
  featured?: boolean
  limit?: number
}

export const I_PROJECT_REPOSITORY = Symbol('IProjectRepository')

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>
  findBySlug(slug: string): Promise<Project | null>
  findPublished(filters?: ProjectFilters): Promise<Project[]>
  findFeatured(): Promise<Project[]>
  findAll(): Promise<Project[]>
  save(project: Project): Promise<Project>
  delete(id: string): Promise<void>
}
