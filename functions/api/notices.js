/**
 * GET  /api/notices       — 로그인 사용자: 전체 공지 / 비로그인: 공개 공지만
 * POST /api/notices       — admin 전용: 공지 생성
 * Body (POST): { title, content, is_public }
 */
import { validateSession } from '../_lib/auth.js';
import { json, err, preflight } from '../_lib/cors.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return preflight();

  const db = env.DB;
  const user = await validateSession(request, db);

  if (request.method === 'GET') {
    let rows;
    if (user) {
      // 로그인: 전체 공지 반환
      rows = await db.prepare(
        'SELECT id, title, content, is_public, created_at FROM notices ORDER BY created_at DESC LIMIT 50'
      ).all();
    } else {
      // 비로그인: 공개 공지만
      rows = await db.prepare(
        'SELECT id, title, content, is_public, created_at FROM notices WHERE is_public = 1 ORDER BY created_at DESC LIMIT 20'
      ).all();
    }
    return json({ notices: rows.results || [] });
  }

  if (request.method === 'POST') {
    if (!user || user.role !== 'admin') return err('관리자 권한이 필요합니다.', 403);

    let body;
    try { body = await request.json(); } catch { return err('Invalid JSON'); }

    const title = (body.title || '').trim();
    const content = (body.content || '').trim();
    const is_public = body.is_public ? 1 : 0;

    if (!title) return err('제목을 입력해주세요.');

    const id = crypto.randomUUID();
    await db.prepare(
      'INSERT INTO notices (id, title, content, is_public, created_by) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, title, content, is_public, user.id).run();

    return json({ id, title, content, is_public, created_at: new Date().toISOString() }, 201);
  }

  return err('Method not allowed', 405);
}
