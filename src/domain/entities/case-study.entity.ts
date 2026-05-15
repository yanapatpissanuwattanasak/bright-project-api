export interface ArchitectureDecision {
  context: string
  decision: string
  rationale: string
  consequences: string
}

export interface ContentSection {
  type: 'text' | 'code' | 'image' | 'callout'
  content: string
  language?: string
}

export class CaseStudy {
  constructor(
    readonly id: string,
    readonly projectId: string,
    public architectureDecisions: ArchitectureDecision[],
    public content: ContentSection[],
    readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
