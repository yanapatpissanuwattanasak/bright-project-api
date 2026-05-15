import { Controller, Get, Param, Query } from '@nestjs/common'
import { GetPublishedProjectsUseCase } from '@application/use-cases/projects/get-published-projects.use-case'
import { GetProjectBySlugUseCase } from '@application/use-cases/projects/get-project-by-slug.use-case'

@Controller('api/projects')
export class ProjectsController {
  constructor(
    private readonly getPublished: GetPublishedProjectsUseCase,
    private readonly getBySlug: GetProjectBySlugUseCase,
  ) {}

  @Get()
  findAll(
    @Query('tag') tag?: string,
    @Query('featured') featured?: string,
    @Query('limit') limit?: string,
  ) {
    return this.getPublished.execute({
      tagSlug: tag,
      featured: featured === 'true',
      limit: limit ? parseInt(limit) : undefined,
    })
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.getBySlug.execute(slug)
  }
}
