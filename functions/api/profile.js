/**
 * PUT /api/profile
 * Header: Authorization: Bearer <token>
 * Body: { name, phone }   (이메일·역할은 변경 불가)
 */
import { validateSession, hashPassword, verifyPassword } from '../_lib/auth.js';
import { json, err, preflight } from '../_lib/cors.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'PUT') return err('Method not allowed', 405);

  const db = env.DB;
  const user = await validateSession(request, db);
  if (!user) return err('인증이 필요합니다.', 401);

  let body;
  try { body = await request.json(); } catch { return err('Invalid JSON'); }

  const name = (body.name || '').trim();
  if (!name) return err('이름을 입력해주세요.');

  // Optional: password change
  if (body.newPassword) {
    if (!body.currentPassword) return err('현재 비밀번호를 입력해주세요.');
    if (body.newPassword.length < 8) return err('새 비밀번호는 8자 이상이어야 합니다.');

    const stored = await db.prepare('SELECT password_hash FROM users WHERE id = ?').bind(user.id).first();
    const ok = await verifyPassword(body.currentPassword, stored.password_hash);
    if (!ok) return err('현재 비밀번호가 올바르지 않습니다.', 401);

    const newHash = await hashPassword(body.newPassword);
    await db.prepare('UPDATE users SET name = ?, password_hash = ? WHERE id = ?')
      .bind(name, newHash, user.id).run();
  } else {
    await db.prepare('UPDATE users SET name = ? WHERE id = ?').bind(name, user.id).run();
  }

  return json({ ok: true, name });
}
