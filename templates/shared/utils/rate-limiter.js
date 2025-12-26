/**
 * Simple rate limiter using sliding window algorithm
 */
export class RateLimiter {
  /**
   * @param {number} maxRequests - Maximum requests allowed in window
   * @param {number} windowMs - Time window in milliseconds
   */
  constructor(maxRequests = 30, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * Throttle the current request
   * Waits if rate limit would be exceeded
   */
  async throttle() {
    const now = Date.now();

    // Remove requests outside the current window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      // Calculate wait time
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // Clean up again after waiting
      const newNow = Date.now();
      this.requests = this.requests.filter(time => newNow - time < this.windowMs);
    }

    this.requests.push(Date.now());
  }

  /**
   * Check if a request would be rate limited without consuming a slot
   */
  wouldLimit() {
    const now = Date.now();
    const recentRequests = this.requests.filter(time => now - time < this.windowMs);
    return recentRequests.length >= this.maxRequests;
  }

  /**
   * Reset the rate limiter
   */
  reset() {
    this.requests = [];
  }
}
