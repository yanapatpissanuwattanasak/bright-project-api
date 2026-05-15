import { randomBytes } from 'crypto'

export class RoomCode {
  private constructor(readonly value: string) {}

  static generate(): RoomCode {
    return new RoomCode(randomBytes(3).toString('hex').toUpperCase())
  }

  static from(raw: string): RoomCode {
    const v = raw.trim().toUpperCase()
    if (!/^[A-F0-9]{6}$/.test(v)) {
      throw new Error('Invalid room code')
    }
    return new RoomCode(v)
  }

  toString(): string {
    return this.value
  }
}
