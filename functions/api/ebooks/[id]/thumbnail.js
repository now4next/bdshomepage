/**
 * GET /api/ebooks/:id/thumbnail
 * R2에서 썸네일 이미지를 서빙 (공개 캐시 가능).
 * 썸네일 없으면 404.
 */
import { err, preflight } from '../../../_lib/cors.js';

export async function onRequest({ request, env, params }) {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'GET') return err('Method not allowed', 405);

  const ebook = await env.DB.prepare(
    `SELECT thumbnail_key FROM ebooks WHERE id = ? AND is_active = 1`
  ).bind(params.id).first();

  if (!ebook || !ebook.thumbnail_key) return err('썸네일 없음', 404);

  const obj = await env.R2.get(ebook.thumbnail_key);
  if (!obj) return err('파일 없음', 404);

  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
