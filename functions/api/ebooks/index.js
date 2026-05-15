/**
 * GET  /api/ebooks  — 전자책 목록 (로그인 여부와 무관, canAccess 플래그 포함)
 * POST /api/ebooks  — 전자책 메타데이터 등록 (admin)
 */
import { json, err, preflight } from '../../_lib/cors.js';
import { validateSession } from '../../_lib/auth.js';

function roleRank(role) {
  if (role === 'admin') return 99;
  if (role === 'member') return 1;
  return 0;
}

function canAccess(userRole, requiredRole) {
  return roleRank(userRole) >= roleRank(requiredRole);
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return preflight();

  /* ── GET: 목록 ── */
  if (request.method === 'GET') {
    const session = await validateSession(request, env.DB);
    const userRole = session?.role || null;
    const userId   = session?.id   || null;

    // SQL CASE로 개별 재정의 → role 기본값 순서로 접근 여부 결정
    const { results } = await env.DB.prepare(`
      SELECT
        e.id, e.title, e.description, e.thumbnail_key,
        e.total_pages, e.required_role, e.created_at,
        CASE
          WHEN ?1 = 'admin'             THEN 1
          WHEN uea.can_access IS NOT NULL THEN uea.can_access
          WHEN e.required_role = 'member' AND ?1 = 'member' THEN 1
          ELSE 0
        END AS canAccess
      FROM ebooks e
      LEFT JOIN user_ebook_access uea
        ON uea.ebook_id = e.id AND uea.user_id = ?2
      WHERE e.is_active = 1
      ORDER BY e.created_at DESC
    `).bind(userRole || '', userId || '').all();

    return json({ ebooks: results });
  }

  /* ── POST: 등록 (admin) ── */
  if (request.method === 'POST') {
    const session = await validateSession(request, env.DB);
    if (!session) return err('로그인이 필요합니다', 401);
    if (session.role !== 'admin') return err('관리자 권한이 필요합니다', 403);

    const { title, description, r2_key, thumbnail_key, total_pages, required_role } =
      await request.json();

    if (!title || !r2_key) return err('title과 r2_key는 필수입니다', 400);

    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO ebooks (id, title, description, r2_key, thumbnail_key, total_pages, required_role, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, title, description || null, r2_key,
      thumbnail_key || null, total_pages || 0,
      required_role || 'member', session.id
    ).run();

    return json({ ok: true, id }, 201);
  }

  return err('Method not allowed', 405);
}
