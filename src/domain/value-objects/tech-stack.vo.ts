export class TechStack {
  private constructor(readonly items: readonly string[]) {}

  static create(items: string[]): TechStack {
    if (!items.length) throw new Error('TechStack must have at least one item')
    return new TechStack(Object.freeze([...items]))
  }

  toArray(): string[] {
    return [...this.items]
  }
}
