import { createHash, randomBytes } from 'node:crypto'

/** Generates a high-entropy opaque token (refresh / password-reset / email-verification tokens). */
export function generateOpaqueToken(): string {
  return randomBytes(32).toString('base64url')
}

/** These tokens are already high-entropy random bytes, so a fast SHA-256 digest is the right tool for
 * at-rest storage (unlike passwords, which need bcrypt's deliberate slowness against low-entropy guessing). */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
