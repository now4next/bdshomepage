/**
 * POST /api/auth/login
 * Body: { email, password }
 */
import { verifyPassword, generateToken, sessionExpiresAt } from '../../_lib/auth.js';
import { json, err, preflight } from '../../_lib/cors.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'POST') return err('Method not allowed', 405);

  const db = env.DB;
  let body;
  try { body = await request.json(); } catch { return err('Invalid JSON'); }

  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  if (!email || !password) return err('이메일과 비밀번호를 입력해주세요.');

  const user = await db
    .prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ?')
    .bind(email)
    .first();

  if (!user) return err('이메일 또는 비밀번호가 올바르지 않습니다.', 401);

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return err('이메일 또는 비밀번호가 올바르지 않습니다.', 401);

  // Clean up expired sessions for this user
  await db.prepare('DELETE FROM sessions WHERE user_id = ? AND expires_at < ?')
    .bind(user.id, new Date().toISOString()).run();

  const token = generateToken();
  const expiresAt = sessionExpiresAt();
  await db.prepare(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
  ).bind(token, user.id, expiresAt).run();

  return json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}
