import { Inject, Injectable } from '@nestjs/common'
import { I_PROJECT_REPOSITORY, IProjectRepository } from '@domain/repositories/i-project.repository'
import type { Project } from '@domain/entities/project.entity'

@Injectable()
export class GetFeaturedProjectsUseCase {
  constructor(
    @Inject(I_PROJECT_REPOSITORY) private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(): Promise<Project[]> {
    return this.projectRepo.findFeatured()
  }
}
