/**
 * GET  /api/popups  — 현재 활성 팝업 (공개, 날짜 범위 체크)
 *                     ?all=1 (admin) → 전체 목록
 * POST /api/popups  — 팝업 생성 (admin)
 */
import { json, err, preflight } from '../../_lib/cors.js';
import { validateSession } from '../../_lib/auth.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return preflight();

  /* ── GET ── */
  if (request.method === 'GET') {
    const session = await validateSession(request, env.DB);
    const isAdmin = session?.role === 'admin';
    const url     = new URL(request.url);

    // 관리자 전체 목록
    if (url.searchParams.get('all') === '1' && isAdmin) {
      const { results } = await env.DB.prepare(
        `SELECT * FROM popups ORDER BY created_at DESC`
      ).all();
      return json({ popups: results });
    }

    // 공개: 활성 팝업 1개 (날짜 범위 체크)
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const popup = await env.DB.prepare(
      `SELECT * FROM popups
       WHERE is_active = 1
         AND (start_date IS NULL OR start_date <= ?)
         AND (end_date   IS NULL OR end_date   >= ?)
       ORDER BY created_at DESC LIMIT 1`
    ).bind(today, today).first();

    return json({ popup: popup || null });
  }

  /* ── POST ── */
  if (request.method === 'POST') {
    const session = await validateSession(request, env.DB);
    if (!session) return err('로그인이 필요합니다', 401);
    if (session.role !== 'admin') return err('관리자 권한이 필요합니다', 403);

    const { title, image_key, link_url, is_active = 0, start_date, end_date } =
      await request.json();
    if (!title?.trim()) return err('제목을 입력해주세요', 400);

    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO popups (id,title,image_key,link_url,is_active,start_date,end_date)
       VALUES (?,?,?,?,?,?,?)`
    ).bind(id, title.trim(), image_key || null, link_url || null,
           is_active ? 1 : 0, start_date || null, end_date || null).run();

    return json({ ok: true, id }, 201);
  }

  return err('Method not allowed', 405);
}
