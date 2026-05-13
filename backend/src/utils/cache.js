// Simple in-memory cache utility (development use)
// Supports TTL and basic get/set/delete operations

const store = new Map();

class Cache {
  set(key, value, ttlSeconds = 0) {
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    store.set(key, { value, expiresAt });
  }

  get(key) {
    const entry = store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    return store.delete(key);
  }

  clear() {
    store.clear();
  }
}

export default new Cache();