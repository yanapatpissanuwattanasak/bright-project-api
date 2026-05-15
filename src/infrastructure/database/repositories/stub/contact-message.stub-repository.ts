import { Injectable } from '@nestjs/common'
import { IContactMessageRepository, ContactMessageFilters } from '@domain/repositories/i-contact-message.repository'
import { ContactMessage } from '@domain/entities/contact-message.entity'

@Injectable()
export class ContactMessageStubRepository implements IContactMessageRepository {
  findAll(_filters?: ContactMessageFilters): Promise<ContactMessage[]> { return Promise.resolve([]) }
  findById(_id: string): Promise<ContactMessage | null> { return Promise.resolve(null) }
  save(message: ContactMessage): Promise<ContactMessage> { return Promise.resolve(message) }
}
