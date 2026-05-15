/**
 * GET   /api/admin/users/:id/ebook-access  — 해당 회원의 자료별 접근 권한 목록
 * PATCH /api/admin/users/:id/ebook-access  — 특정 ebook 권한 설정
 *   body: { ebook_id, can_access: 1 | 0 | null }
 *         null → 개별 재정의 삭제(role 기본값으로 복원)
 */
import { json, err, preflight } from '../../../../_lib/cors.js';
import { validateSession } from '../../../../_lib/auth.js';

export async function onRequest({ request, env, params }) {
  if (request.method === 'OPTIONS') return preflight();

  const session = await validateSession(request, env.DB);
  if (!session) return err('로그인이 필요합니다', 401);
  if (session.role !== 'admin') return err('관리자 권한이 필요합니다', 403);

  const targetId = params.id;

  // 대상 사용자 존재 확인
  const target = await env.DB.prepare(
    `SELECT id, name, role FROM users WHERE id = ?`
  ).bind(targetId).first();
  if (!target) return err('사용자를 찾을 수 없습니다', 404);

  /* ── GET: 전체 ebook 목록 + 이 사용자의 개별 권한 상태 ── */
  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(`
      SELECT
        e.id, e.title, e.required_role, e.total_pages,
        uea.can_access AS override
      FROM ebooks e
      LEFT JOIN user_ebook_access uea
        ON uea.ebook_id = e.id AND uea.user_id = ?
      WHERE e.is_active = 1
      ORDER BY e.created_at DESC
    `).bind(targetId).all();

    // 실효 접근 여부 계산 (override 없으면 role 기본값)
    const list = results.map(r => ({
      id:            r.id,
      title:         r.title,
      required_role: r.required_role,
      total_pages:   r.total_pages,
      override:      r.override,          // null = 재정의 없음
      effective:     r.override !== null
                       ? Boolean(r.override)
                       : (target.role === 'admin' || r.required_role === 'member'),
    }));

    return json({ user: target, ebooks: list });
  }

  /* ── PATCH: 특정 ebook 권한 설정/해제 ── */
  if (request.method === 'PATCH') {
    const { ebook_id, can_access } = await request.json();
    if (!ebook_id) return err('ebook_id가 필요합니다', 400);

    if (can_access === null || can_access === undefined) {
      // 개별 재정의 삭제 → 기본값(role 기반)으로 복원
      await env.DB.prepare(
        `DELETE FROM user_ebook_access WHERE user_id = ? AND ebook_id = ?`
      ).bind(targetId, ebook_id).run();
    } else {
      // 허용(1) 또는 차단(0) 설정
      await env.DB.prepare(`
        INSERT INTO user_ebook_access (user_id, ebook_id, can_access, granted_by, granted_at)
        VALUES (?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id, ebook_id) DO UPDATE SET
          can_access = excluded.can_access,
          granted_by = excluded.granted_by,
          granted_at = excluded.granted_at
      `).bind(targetId, ebook_id, can_access ? 1 : 0, session.id).run();
    }

    return json({ ok: true });
  }

  return err('Method not allowed', 405);
}
