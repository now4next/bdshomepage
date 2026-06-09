/**
 * PATCH  /api/popups/:id  — 팝업 수정 (admin)
 * DELETE /api/popups/:id  — 팝업 삭제 (admin)
 */
import { json, err, preflight } from '../../_lib/cors.js';
import { validateSession } from '../../_lib/auth.js';

export async function onRequest({ request, env, params }) {
  if (request.method === 'OPTIONS') return preflight();

  const session = await validateSession(request, env.DB);
  if (!session) return err('로그인이 필요합니다', 401);
  if (session.role !== 'admin') return err('관리자 권한이 필요합니다', 403);

  /* ── PATCH ── */
  if (request.method === 'PATCH') {
    const body   = await request.json();
    const fields = [];
    const vals   = [];
    const allowed = ['title','image_key','link_url','is_active','start_date','end_date'];
    for (const [k, v] of Object.entries(body)) {
      if (allowed.includes(k)) { fields.push(`${k} = ?`); vals.push(v); }
    }
    if (!fields.length) return err('수정할 필드가 없습니다', 400);
    vals.push(params.id);

    const result = await env.DB.prepare(
      `UPDATE popups SET ${fields.join(', ')} WHERE id = ?`
    ).bind(...vals).run();

    if (!result.meta.changes) return err('팝업을 찾을 수 없습니다', 404);
    return json({ ok: true });
  }

  /* ── DELETE ── */
  if (request.method === 'DELETE') {
    const result = await env.DB.prepare('DELETE FROM popups WHERE id = ?')
      .bind(params.id).run();
    if (!result.meta.changes) return err('팝업을 찾을 수 없습니다', 404);
    return json({ ok: true });
  }

  return err('Method not allowed', 405);
}
