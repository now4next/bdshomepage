/**
 * GET /api/media/*  — R2 공개 미디어 서빙 (팝업 이미지, 블로그 썸네일)
 * 허용 prefix: popups/, posts/, media/
 */
import { preflight } from '../../_lib/cors.js';

const ALLOWED_PREFIXES = ['popups/', 'posts/', 'media/'];
const MIME = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png', webp: 'image/webp', gif: 'image/gif',
};

export async function onRequest({ request, env, params }) {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!env.R2) return new Response('Storage unavailable', { status: 503 });

  const segments = Array.isArray(params.path) ? params.path : [params.path];
  const key = segments.join('/');

  const allowed = ALLOWED_PREFIXES.some(p => key.startsWith(p));
  if (!allowed) return new Response('Not found', { status: 404 });

  const obj = await env.R2.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const ext = key.split('.').pop().toLowerCase();
  const contentType = obj.httpMetadata?.contentType || MIME[ext] || 'application/octet-stream';

  return new Response(obj.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'ETag': obj.httpEtag,
    },
  });
}
