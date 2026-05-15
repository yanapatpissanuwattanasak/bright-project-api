import { Injectable } from '@nestjs/common'
import { ICaseStudyRepository } from '@domain/repositories/i-case-study.repository'
import { CaseStudy } from '@domain/entities/case-study.entity'

@Injectable()
export class CaseStudyStubRepository implements ICaseStudyRepository {
  findByProjectId(_projectId: string): Promise<CaseStudy | null> { return Promise.resolve(null) }
  save(caseStudy: CaseStudy): Promise<CaseStudy> { return Promise.resolve(caseStudy) }
}
