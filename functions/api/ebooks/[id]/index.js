/**
 * GET    /api/ebooks/:id  — 전자책 메타데이터
 * PATCH  /api/ebooks/:id  — 수정 (admin)
 * DELETE /api/ebooks/:id  — 비활성화 (admin)
 */
import { json, err, preflight } from '../../../_lib/cors.js';
import { validateSession } from '../../../_lib/auth.js';

function canAccess(userRole, requiredRole) {
  if (!userRole) return false;
  if (userRole === 'admin') return true;
  if (requiredRole === 'member' && userRole === 'member') return true;
  return false;
}

export async function onRequest({ request, env, params }) {
  if (request.method === 'OPTIONS') return preflight();

  const id = params.id;
  const session = await validateSession(request, env.DB);

  /* ── GET ── */
  if (request.method === 'GET') {
    const ebook = await env.DB.prepare(
      `SELECT id, title, description, thumbnail_key, total_pages, required_role, created_at
       FROM ebooks WHERE id = ? AND is_active = 1`
    ).bind(id).first();

    if (!ebook) return err('찾을 수 없습니다', 404);

    return json({
      ...ebook,
      canAccess: canAccess(session?.role || null, ebook.required_role),
    });
  }

  /* ── PATCH ── */
  if (request.method === 'PATCH') {
    if (!session || session.role !== 'admin') return err('권한 없음', 403);

    const body = await request.json();
    const fields = [];
    const vals = [];

    for (const [k, v] of Object.entries(body)) {
      if (['title', 'description', 'total_pages', 'required_role', 'is_active'].includes(k)) {
        fields.push(`${k} = ?`);
        vals.push(v);
      }
    }
    if (!fields.length) return err('수정할 필드가 없습니다', 400);

    vals.push(id);
    await env.DB.prepare(`UPDATE ebooks SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...vals).run();

    return json({ ok: true });
  }

  /* ── DELETE (soft) ── */
  if (request.method === 'DELETE') {
    if (!session || session.role !== 'admin') return err('권한 없음', 403);

    await env.DB.prepare(`UPDATE ebooks SET is_active = 0 WHERE id = ?`).bind(id).run();
    return json({ ok: true });
  }

  return err('Method not allowed', 405);
}
