import { Module } from '@nestjs/common'
import { ProjectsController } from '../controllers/projects.controller'
import { GetPublishedProjectsUseCase } from '@application/use-cases/projects/get-published-projects.use-case'
import { GetProjectBySlugUseCase } from '@application/use-cases/projects/get-project-by-slug.use-case'
import { GetFeaturedProjectsUseCase } from '@application/use-cases/projects/get-featured-projects.use-case'
import { I_PROJECT_REPOSITORY } from '@domain/repositories/i-project.repository'
import { I_CASE_STUDY_REPOSITORY } from '@domain/repositories/i-case-study.repository'
import { I_TAG_REPOSITORY } from '@domain/repositories/i-tag.repository'
import { ProjectStubRepository } from '@infrastructure/database/repositories/stub/project.stub-repository'
import { CaseStudyStubRepository } from '@infrastructure/database/repositories/stub/case-study.stub-repository'
import { TagStubRepository } from '@infrastructure/database/repositories/stub/tag.stub-repository'

@Module({
  imports: [],
  controllers: [ProjectsController],
  providers: [
    GetPublishedProjectsUseCase,
    GetProjectBySlugUseCase,
    GetFeaturedProjectsUseCase,
    { provide: I_PROJECT_REPOSITORY, useClass: ProjectStubRepository },
    { provide: I_CASE_STUDY_REPOSITORY, useClass: CaseStudyStubRepository },
    { provide: I_TAG_REPOSITORY, useClass: TagStubRepository },
  ],
  exports: [],
})
export class ProjectsModule {}
