export type ProjectType = 'freelance' | 'fulltime' | 'consulting' | 'other'

export class ContactMessage {
  constructor(
    readonly id: string,
    public name: string,
    public email: string,
    public message: string,
    public projectType: ProjectType,
    public isRead: boolean,
    readonly ipAddress: string | null,
    readonly createdAt: Date,
  ) {}

  markRead(): void {
    this.isRead = true
  }
}
