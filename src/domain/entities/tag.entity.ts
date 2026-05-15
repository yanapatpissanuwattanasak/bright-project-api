export class Tag {
  constructor(
    readonly id: string,
    public name: string,
    public slug: string,
    public color: string | null,
    readonly createdAt: Date,
  ) {}
}
