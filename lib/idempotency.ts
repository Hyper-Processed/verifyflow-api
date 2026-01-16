import { kv } from '@vercel/kv';

/**
 * Webhook Idempotency Utilities
 *
 * Prevents duplicate processing of Stripe webhook events by tracking
 * processed event IDs. Uses a 24-hour TTL to balance memory usage
 * with protection against delayed retries.
 */

// TTL for processed event IDs (24 hours in seconds)
const IDEMPOTENCY_TTL = 86400;

// Prefix for idempotency keys
const IDEM_PREFIX = 'webhook:processed:';

/**
 * Check if a webhook event has already been processed
 * Returns true if event was already processed (should skip)
 */
export async function isEventProcessed(eventId: string): Promise<boolean> {
  const key = `${IDEM_PREFIX}${eventId}`;
  const exists = await kv.exists(key);
  return exists === 1;
}

/**
 * Mark a webhook event as processed
 * Should be called AFTER successful processing
 */
export async function markEventProcessed(eventId: string): Promise<void> {
  const key = `${IDEM_PREFIX}${eventId}`;
  await kv.set(key, Date.now(), { ex: IDEMPOTENCY_TTL });
}

/**
 * Atomic check-and-mark for event processing
 * Returns true if this call claimed the event (should process)
 * Returns false if event was already claimed (should skip)
 *
 * Uses SET NX (only set if not exists) for atomic operation
 */
export async function claimEvent(eventId: string): Promise<boolean> {
  const key = `${IDEM_PREFIX}${eventId}`;
  // SETNX returns 1 if key was set, 0 if it already existed
  const result = await kv.setnx(key, Date.now());

  if (result === 1) {
    // We claimed it - set the TTL
    await kv.expire(key, IDEMPOTENCY_TTL);
    return true;
  }

  return false;
}

/**
 * Get processing status for an event (for debugging)
 */
export async function getEventStatus(
  eventId: string
): Promise<{ processed: boolean; timestamp?: number }> {
  const key = `${IDEM_PREFIX}${eventId}`;
  const timestamp = await kv.get<number>(key);

  if (timestamp === null) {
    return { processed: false };
  }

  return { processed: true, timestamp };
}
