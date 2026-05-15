import { Inject, Injectable } from '@nestjs/common'
import { I_PROJECT_REPOSITORY, IProjectRepository, ProjectFilters } from '@domain/repositories/i-project.repository'
import type { Project } from '@domain/entities/project.entity'

@Injectable()
export class GetPublishedProjectsUseCase {
  constructor(
    @Inject(I_PROJECT_REPOSITORY) private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(filters?: ProjectFilters): Promise<Project[]> {
    return this.projectRepo.findPublished(filters)
  }
}
