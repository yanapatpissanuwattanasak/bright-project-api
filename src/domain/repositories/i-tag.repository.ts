import { Tag } from '../entities/tag.entity'

export const I_TAG_REPOSITORY = Symbol('ITagRepository')

export interface ITagRepository {
  findAll(): Promise<Tag[]>
  findBySlug(slug: string): Promise<Tag | null>
  findByIds(ids: string[]): Promise<Tag[]>
  save(tag: Tag): Promise<Tag>
}
