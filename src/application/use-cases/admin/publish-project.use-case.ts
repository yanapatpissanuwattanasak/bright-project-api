import { Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { I_PROJECT_REPOSITORY, IProjectRepository } from '@domain/repositories/i-project.repository'
import type { Project } from '@domain/entities/project.entity'

@Injectable()
export class PublishProjectUseCase {
  constructor(
    @Inject(I_PROJECT_REPOSITORY) private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(id: string): Promise<Project> {
    const project = await this.projectRepo.findById(id)
    if (!project) throw new NotFoundException(`Project not found: ${id}`)

    const check = project.canPublish()
    if (!check.ok) {
      throw new UnprocessableEntityException({
        code: 'PUBLISH_PRECONDITION_FAILED',
        message: `Cannot publish: missing fields`,
        details: check.missing.map((f) => ({ field: f, message: `${f} is required to publish` })),
      })
    }

    project.publish()
    return this.projectRepo.save(project)
  }
}
