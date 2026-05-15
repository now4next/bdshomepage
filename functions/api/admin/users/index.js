/**
 * GET /api/admin/users — 전체 회원 목록 (admin only)
 */
import { json, err, preflight } from '../../../_lib/cors.js';
import { validateSession } from '../../../_lib/auth.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'GET') return err('Method not allowed', 405);

  const session = await validateSession(request, env.DB);
  if (!session) return err('로그인이 필요합니다', 401);
  if (session.role !== 'admin') return err('관리자 권한이 필요합니다', 403);

  const { results } = await env.DB.prepare(
    `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`
  ).all();

  return json({ users: results });
}
