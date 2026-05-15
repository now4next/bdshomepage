/**
 * PATCH /api/admin/users/:id — 회원 role 변경 (admin only)
 * body: { role: 'member' | 'admin' }
 */
import { json, err, preflight } from '../../../_lib/cors.js';
import { validateSession } from '../../../_lib/auth.js';

export async function onRequest({ request, env, params }) {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'PATCH') return err('Method not allowed', 405);

  const session = await validateSession(request, env.DB);
  if (!session) return err('로그인이 필요합니다', 401);
  if (session.role !== 'admin') return err('관리자 권한이 필요합니다', 403);

  const { role } = await request.json();
  if (!['member', 'admin'].includes(role)) return err('유효하지 않은 role입니다', 400);

  // 자기 자신의 role 변경 방지
  if (params.id === session.id) return err('자신의 권한은 변경할 수 없습니다', 400);

  const result = await env.DB.prepare(
    `UPDATE users SET role = ? WHERE id = ?`
  ).bind(role, params.id).run();

  if (!result.meta.changes) return err('사용자를 찾을 수 없습니다', 404);

  return json({ ok: true });
}
