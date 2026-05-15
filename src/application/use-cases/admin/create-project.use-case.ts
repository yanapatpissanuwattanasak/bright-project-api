import { Inject, Injectable } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { I_PROJECT_REPOSITORY, IProjectRepository } from '@domain/repositories/i-project.repository'
import { Project } from '@domain/entities/project.entity'
import { ProjectStatus } from '@domain/value-objects/project-status.vo'

export interface CreateProjectInput {
  title: string
  slug: string
  summary: string
  problem: string
  solution: string
  techStack: string[]
  metrics: Array<{ label: string; value: string }>
  loomUrl?: string
  demoUrl?: string
  githubUrl?: string
  thumbnailUrl?: string
  sortOrder: number
  isFeatured: boolean
}

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(I_PROJECT_REPOSITORY) private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    const now = new Date()
    const project = new Project(
      uuidv4(),
      input.title,
      input.slug,
      input.summary,
      input.problem,
      input.solution,
      input.techStack,
      input.metrics,
      input.sortOrder,
      input.isFeatured,
      ProjectStatus.DRAFT,
      input.loomUrl ?? null,
      input.demoUrl ?? null,
      input.githubUrl ?? null,
      input.thumbnailUrl ?? null,
      null,
      now,
      now,
    )
    return this.projectRepo.save(project)
  }
}
