/**
 * Simple in-memory cache with TTL.
 * Suitable for development; swap for Redis in production if needed.
 */
class CacheService {
  constructor(ttlSeconds = 300) {
    this.ttlMs = ttlSeconds * 1000;
    this.store = new Map();
  }

  _now() {
    return Date.now();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (this._now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key, value) {
    this.store.set(key, {
      value,
      expiresAt: this._now() + this.ttlMs,
    });
  }

  clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}

module.exports = CacheService;
