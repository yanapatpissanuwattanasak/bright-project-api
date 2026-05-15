export class Slug {
  private constructor(readonly value: string) {}

  static create(raw: string): Slug {
    const value = raw.toLowerCase().trim().replace(/\s+/g, '-')
    if (value.length < 3 || value.length > 120) {
      throw new Error('Slug must be 3–120 characters')
    }
    if (!/^[a-z0-9-]+$/.test(value)) {
      throw new Error('Slug must contain only lowercase letters, numbers, and hyphens')
    }
    return new Slug(value)
  }

  toString(): string {
    return this.value
  }
}
