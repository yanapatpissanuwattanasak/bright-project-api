export const I_RATE_LIMITER = Symbol('IRateLimiter')

export interface IRateLimiter {
  check(key: string, limit: number, windowMs: number): Promise<boolean>
}
