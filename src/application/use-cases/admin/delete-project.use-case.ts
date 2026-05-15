import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { I_PROJECT_REPOSITORY, IProjectRepository } from '@domain/repositories/i-project.repository'

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    @Inject(I_PROJECT_REPOSITORY) private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const project = await this.projectRepo.findById(id)
    if (!project) throw new NotFoundException(`Project not found: ${id}`)
    // Soft delete via archive so slug UNIQUE constraint is preserved
    project.archive()
    await this.projectRepo.save(project)
  }
}
