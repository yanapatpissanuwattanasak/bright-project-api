import { Injectable } from '@nestjs/common'
import { IRateLimiter } from '@application/ports/i-rate-limiter.port'

interface Bucket {
  count: number
  resetAt: number
}

@Injectable()
export class InMemoryRateLimiterAdapter implements IRateLimiter {
  private readonly store = new Map<string, Bucket>()

  async check(key: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now()
    const bucket = this.store.get(key)

    if (!bucket || now > bucket.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs })
      return true
    }

    if (bucket.count >= limit) return false

    bucket.count++
    return true
  }
}
