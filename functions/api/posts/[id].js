/**
 * GET    /api/posts/:id  — 단일 글 (비로그인: 공개글만)
 * PATCH  /api/posts/:id  — 수정 (admin)
 * DELETE /api/posts/:id  — 삭제 (admin)
 */
import { json, err, preflight } from '../../_lib/cors.js';
import { validateSession } from '../../_lib/auth.js';

export async function onRequest({ request, env, params }) {
  if (request.method === 'OPTIONS') return preflight();

  const id      = params.id;
  const session = await validateSession(request, env.DB);
  const isAdmin = session?.role === 'admin';

  /* ── GET ── */
  if (request.method === 'GET') {
    const post = await env.DB.prepare(
      `SELECT id,title,content,excerpt,thumbnail_key,category,author_name,is_published,created_at,updated_at
       FROM posts WHERE id = ?`
    ).bind(id).first();

    if (!post) return err('게시물을 찾을 수 없습니다', 404);
    if (!post.is_published && !isAdmin) return err('비공개 게시물입니다', 403);
    return json(post);
  }

  /* ── PATCH ── */
  if (request.method === 'PATCH') {
    if (!session) return err('로그인이 필요합니다', 401);
    if (!isAdmin) return err('관리자 권한이 필요합니다', 403);

    const body   = await request.json();
    const fields = [];
    const vals   = [];
    const allowed = ['title','content','excerpt','thumbnail_key','category','is_published'];
    for (const [k, v] of Object.entries(body)) {
      if (allowed.includes(k)) { fields.push(`${k} = ?`); vals.push(v); }
    }
    if (!fields.length) return err('수정할 필드가 없습니다', 400);
    fields.push('updated_at = ?');
    vals.push(new Date().toISOString(), id);

    const result = await env.DB.prepare(
      `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`
    ).bind(...vals).run();

    if (!result.meta.changes) return err('게시물을 찾을 수 없습니다', 404);
    return json({ ok: true });
  }

  /* ── DELETE ── */
  if (request.method === 'DELETE') {
    if (!session) return err('로그인이 필요합니다', 401);
    if (!isAdmin) return err('관리자 권한이 필요합니다', 403);

    const result = await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
    if (!result.meta.changes) return err('게시물을 찾을 수 없습니다', 404);
    return json({ ok: true });
  }

  return err('Method not allowed', 405);
}
