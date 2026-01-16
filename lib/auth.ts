import { createHash, randomBytes } from 'crypto';

/**
 * API Key Security Utilities
 *
 * Uses SHA-256 for API key hashing. This is appropriate for API keys because:
 * - API keys are already high-entropy (48+ random bytes)
 * - We need deterministic hashing for lookups
 * - Speed is acceptable since brute-force is impractical
 */

// Prefix for hashed API key storage
const HASH_PREFIX = 'sha256:';

/**
 * Generate a new API key with a secure random value
 * Format: sk_live_<48 hex chars>
 */
export function generateApiKey(): string {
  return `sk_live_${randomBytes(24).toString('hex')}`;
}

/**
 * Hash an API key for secure storage
 * Returns a prefixed hash for future algorithm migration
 */
export function hashApiKey(apiKey: string): string {
  const hash = createHash('sha256').update(apiKey).digest('hex');
  return `${HASH_PREFIX}${hash}`;
}

/**
 * Verify an API key against a stored hash
 */
export function verifyApiKey(apiKey: string, storedHash: string): boolean {
  if (!storedHash.startsWith(HASH_PREFIX)) {
    // Legacy unhashed key - direct comparison (for migration)
    return apiKey === storedHash;
  }

  const expectedHash = hashApiKey(apiKey);
  return storedHash === expectedHash;
}

/**
 * Extract the key ID from an API key for logging (first 8 chars after prefix)
 * Never log the full API key
 */
export function getKeyId(apiKey: string): string {
  if (apiKey.startsWith('sk_live_')) {
    return apiKey.substring(8, 16);
  }
  return apiKey.substring(0, 8);
}

/**
 * Mask an API key for display (show first and last 4 chars)
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length < 16) return '****';
  return `${apiKey.substring(0, 12)}...${apiKey.substring(apiKey.length - 4)}`;
}
