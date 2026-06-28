// ─── Cache-Control ─────────────────────────────────────────────────────────────
// Prevents browsers and proxies from caching authenticated API responses.
// Attach to any route that returns session-sensitive data.
export function noStore(req, res, next) {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
  });
  next();
}

// ─── JWT Denylist ─────────────────────────────────────────────────────────────
// In-memory denylist keyed by JTI (JWT ID) → token expiry (Unix seconds).
// Tokens survive up to 24 h (our JWT_EXPIRES_IN), so the set stays small.
// On server restart the denylist is cleared; lingering tokens expire naturally.
const denylist = new Map(); // jti → exp (Unix seconds)

export function addToDenylist(jti, exp) {
  if (jti && exp) denylist.set(jti, exp);
}

export function isRevoked(jti) {
  if (!jti || !denylist.has(jti)) return false;
  const exp = denylist.get(jti);
  if (Math.floor(Date.now() / 1000) >= exp) {
    denylist.delete(jti); // expired — clean up opportunistically
    return false;
  }
  return true;
}

// Purge expired entries once per hour so the map doesn't grow unbounded
const _cleanup = setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [jti, exp] of denylist) {
    if (now >= exp) denylist.delete(jti);
  }
}, 60 * 60 * 1000);
// Don't keep the Node process alive just for the cleanup timer
if (_cleanup.unref) _cleanup.unref();
