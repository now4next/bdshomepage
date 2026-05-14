/**
 * BDS Auth Utilities — Cloudflare Workers (Web Crypto API)
 * PBKDF2-SHA256 password hashing + session token management
 */

const ITERATIONS = 100_000;
const KEY_LEN = 32; // bytes → 256 bits

function hexEncode(buf) {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexDecode(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2)
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return bytes;
}

/**
 * Hash a plaintext password.
 * Returns "saltHex:hashHex" string.
 */
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder().encode(password);
  const key = await crypto.subtle.importKey('raw', enc, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key, KEY_LEN * 8
  );
  return `${hexEncode(salt)}:${hexEncode(bits)}`;
}

/**
 * Verify a plaintext password against a stored hash.
 */
export async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = hexDecode(saltHex);
  const enc = new TextEncoder().encode(password);
  const key = await crypto.subtle.importKey('raw', enc, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key, KEY_LEN * 8
  );
  return hexEncode(bits) === hashHex;
}

/**
 * Generate a cryptographically random 64-hex-char session token.
 */
export function generateToken() {
  return hexEncode(crypto.getRandomValues(new Uint8Array(32)));
}

/**
 * Session TTL: 7 days
 */
export function sessionExpiresAt() {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Validate session token from Authorization header.
 * Returns user row or null.
 */
export async function validateSession(request, db) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  if (!token) return null;

  const now = new Date().toISOString();
  const row = await db
    .prepare('SELECT s.user_id, u.id, u.name, u.email, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ?')
    .bind(token, now)
    .first();
  return row || null;
}
