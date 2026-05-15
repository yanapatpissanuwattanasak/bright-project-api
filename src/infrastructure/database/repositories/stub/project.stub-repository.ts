import { Injectable } from '@nestjs/common'
import { IProjectRepository, ProjectFilters } from '@domain/repositories/i-project.repository'
import { Project } from '@domain/entities/project.entity'

@Injectable()
export class ProjectStubRepository implements IProjectRepository {
  findById(_id: string): Promise<Project | null> { return Promise.resolve(null) }
  findBySlug(_slug: string): Promise<Project | null> { return Promise.resolve(null) }
  findPublished(_filters?: ProjectFilters): Promise<Project[]> { return Promise.resolve([]) }
  findFeatured(): Promise<Project[]> { return Promise.resolve([]) }
  findAll(): Promise<Project[]> { return Promise.resolve([]) }
  save(project: Project): Promise<Project> { return Promise.resolve(project) }
  delete(_id: string): Promise<void> { return Promise.resolve() }
}
