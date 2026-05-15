import { ContactMessage } from '../entities/contact-message.entity'

export const I_CONTACT_MESSAGE_REPOSITORY = Symbol('IContactMessageRepository')

export interface ContactMessageFilters {
  unreadOnly?: boolean
}

export interface IContactMessageRepository {
  findAll(filters?: ContactMessageFilters): Promise<ContactMessage[]>
  findById(id: string): Promise<ContactMessage | null>
  save(message: ContactMessage): Promise<ContactMessage>
}
