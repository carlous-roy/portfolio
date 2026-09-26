// Sliding-window counter kept in the memory of one serverless instance.
//
// This is a cost guard, not a security control. Instances are not shared, a
// cold start empties the map, and a caller who rotates addresses is not
// slowed down. What it does is stop one client from hammering a warm instance
// in a loop. The spend limit on the key is the control that bounds cost.

export function createRateLimiter({ windowMs, max, now = Date.now, maxKeys = 5000 } = {}) {
  const hits = new Map()

  function sweep(current) {
    for (const [key, times] of hits) {
      if (!times.some((t) => current - t < windowMs)) hits.delete(key)
    }
  }

  return {
    // Records a hit for `key` and returns true when the caller is over the limit.
    hit(key) {
      const current = now()
      const recent = (hits.get(key) || []).filter((t) => current - t < windowMs)
      if (recent.length >= max) {
        hits.set(key, recent)
        return true
      }
      recent.push(current)
      hits.set(key, recent)
      if (hits.size > maxKeys) sweep(current)
      return false
    },
    size() {
      return hits.size
    },
  }
}
