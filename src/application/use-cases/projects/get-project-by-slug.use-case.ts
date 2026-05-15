import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { I_PROJECT_REPOSITORY, IProjectRepository } from '@domain/repositories/i-project.repository'
import { I_CASE_STUDY_REPOSITORY, ICaseStudyRepository } from '@domain/repositories/i-case-study.repository'
import type { Project } from '@domain/entities/project.entity'
import type { CaseStudy } from '@domain/entities/case-study.entity'

export interface ProjectWithCaseStudy extends Project {
  caseStudy: CaseStudy | null
}

@Injectable()
export class GetProjectBySlugUseCase {
  constructor(
    @Inject(I_PROJECT_REPOSITORY) private readonly projectRepo: IProjectRepository,
    @Inject(I_CASE_STUDY_REPOSITORY) private readonly caseStudyRepo: ICaseStudyRepository,
  ) {}

  async execute(slug: string): Promise<ProjectWithCaseStudy> {
    const project = await this.projectRepo.findBySlug(slug)
    if (!project) throw new NotFoundException(`Project not found: ${slug}`)

    const caseStudy = await this.caseStudyRepo.findByProjectId(project.id)
    ;(project as ProjectWithCaseStudy).caseStudy = caseStudy
    return project as ProjectWithCaseStudy
  }
}
