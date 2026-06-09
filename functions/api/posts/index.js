/**
 * GET  /api/posts  — 목록 (공개: is_published=1, 관리자: 전체)
 * POST /api/posts  — 글 작성 (admin)
 *
 * Query (GET): category, limit, offset, all=1(admin 전체)
 */
import { json, err, preflight } from '../../_lib/cors.js';
import { validateSession } from '../../_lib/auth.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return preflight();

  /* ── GET ── */
  if (request.method === 'GET') {
    const session = await validateSession(request, env.DB);
    const isAdmin = session?.role === 'admin';
    const url      = new URL(request.url);
    const category = url.searchParams.get('category');
    const limit    = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 50);
    const offset   = parseInt(url.searchParams.get('offset') || '0', 10);
    const showAll  = url.searchParams.get('all') === '1' && isAdmin;

    const where = showAll ? [] : ['is_published = 1'];
    const params = [];
    if (category) { where.push('category = ?'); params.push(category); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const { results } = await env.DB.prepare(
      `SELECT id, title, excerpt, thumbnail_key, category, author_name,
              is_published, created_at, updated_at
       FROM posts ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...params, limit, offset).all();

    const { total } = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM posts ${whereClause}`
    ).bind(...params).first();

    return json({ posts: results, total, limit, offset });
  }

  /* ── POST ── */
  if (request.method === 'POST') {
    const session = await validateSession(request, env.DB);
    if (!session) return err('로그인이 필요합니다', 401);
    if (session.role !== 'admin') return err('관리자 권한이 필요합니다', 403);

    const { title, content = '', excerpt, thumbnail_key, category = 'news', is_published = 0 } =
      await request.json();
    if (!title?.trim()) return err('제목을 입력해주세요', 400);

    const id  = crypto.randomUUID();
    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO posts (id,title,content,excerpt,thumbnail_key,category,author_name,is_published,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    ).bind(id, title.trim(), content, excerpt || null, thumbnail_key || null,
           category, session.name, is_published ? 1 : 0, now, now).run();

    return json({ ok: true, id }, 201);
  }

  return err('Method not allowed', 405);
}
