/**
 * In-memory rate limiting utility.
 * Use this to protect public API routes from brute-force and spam attacks.
 */

const rateLimitMap = new Map();

/**
 * 
 * @param {string} ip - The client's IP address
 * @param {number} limit - Max number of requests allowed
 * @param {number} windowMs - Time window in milliseconds (e.g., 15 * 60 * 1000 for 15 mins)
 * @returns {boolean} - true if allowed, false if rate limited
 */
export function checkRateLimit(ip, limit = 5, windowMs = 15 * 60 * 1000) {
  if (!ip) return true; // fallback if IP cannot be determined

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  // If the time window has passed, reset the count
  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  // Increment the count
  record.count += 1;
  rateLimitMap.set(ip, record);

  // If count exceeds limit, block
  if (record.count > limit) {
    return false;
  }

  return true;
}

// Cleanup function to prevent memory leaks over time (can be called periodically if needed, though Maps usually handle standard IP volumes well)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60 * 60 * 1000); // Cleanup every 1 hour
