import { Injectable } from '@nestjs/common'
import { ITagRepository } from '@domain/repositories/i-tag.repository'
import { Tag } from '@domain/entities/tag.entity'

@Injectable()
export class TagStubRepository implements ITagRepository {
  findAll(): Promise<Tag[]> { return Promise.resolve([]) }
  findBySlug(_slug: string): Promise<Tag | null> { return Promise.resolve(null) }
  findByIds(_ids: string[]): Promise<Tag[]> { return Promise.resolve([]) }
  save(tag: Tag): Promise<Tag> { return Promise.resolve(tag) }
}
