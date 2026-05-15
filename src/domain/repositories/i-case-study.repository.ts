import { CaseStudy } from '../entities/case-study.entity'

export const I_CASE_STUDY_REPOSITORY = Symbol('ICaseStudyRepository')

export interface ICaseStudyRepository {
  findByProjectId(projectId: string): Promise<CaseStudy | null>
  save(caseStudy: CaseStudy): Promise<CaseStudy>
}
