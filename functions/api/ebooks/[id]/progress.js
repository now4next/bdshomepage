/**
 * GET /api/ebooks/:id/progress  — 마지막 읽은 페이지 조회
 * PUT /api/ebooks/:id/progress  — 마지막 읽은 페이지 저장 (이어읽기)
 */
import { json, err, preflight } from '../../../_lib/cors.js';
import { validateSession } from '../../../_lib/auth.js';

export async function onRequest({ request, env, params }) {
  if (request.method === 'OPTIONS') return preflight();

  const session = await validateSession(request, env.DB);
  if (!session) return err('로그인이 필요합니다', 401);

  const ebookId = params.id;

  if (request.method === 'GET') {
    const row = await env.DB.prepare(
      `SELECT last_page FROM ebook_views WHERE ebook_id = ? AND user_id = ?`
    ).bind(ebookId, session.id).first();

    return json({ last_page: row?.last_page ?? 1 });
  }

  if (request.method === 'PUT') {
    const { last_page } = await request.json();
    if (!last_page || last_page < 1) return err('유효하지 않은 페이지 번호', 400);

    await env.DB.prepare(
      `INSERT INTO ebook_views (ebook_id, user_id, last_page, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(ebook_id, user_id)
       DO UPDATE SET last_page = excluded.last_page, updated_at = excluded.updated_at`
    ).bind(ebookId, session.id, last_page).run();

    return json({ ok: true });
  }

  return err('Method not allowed', 405);
}
