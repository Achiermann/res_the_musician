/**
 * Simple in-memory rate limiter
 * Replace with durable store (Redis, Upstash) in production
 */

const hits = new Map();

/**
 * Rate limits requests based on a key
 * @param {object} options - Rate limit configuration
 * @param {string} options.key - Unique identifier for this limit (e.g., IP + endpoint)
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests allowed in window
 * @returns {object} { ok: boolean, remaining: number, reset: number }
 */
export function rateLimit({ key, windowMs = 10_000, max = 20 }) {
  const now = Date.now();
  const tracker = hits.get(key) || { count: 0, reset: now + windowMs };

  // Reset window if expired
  if (now > tracker.reset) {
    tracker.count = 0;
    tracker.reset = now + windowMs;
  }

  tracker.count += 1;
  hits.set(key, tracker);

  return {
    ok: tracker.count <= max,
    remaining: Math.max(0, max - tracker.count),
    reset: tracker.reset
  };
}
