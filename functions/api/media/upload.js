/**
 * POST /api/media/upload
 * multipart/form-data: file (image), prefix ('popups'|'posts'), id?
 * 반환: { ok, key, url }
 *
 * 팝업 이미지와 블로그 썸네일/콘텐츠 이미지를 R2에 저장한다.
 */
import { json, err, preflight } from '../../_lib/cors.js';
import { validateSession } from '../../_lib/auth.js';

const ALLOWED_TYPES = ['image/jpeg','image/jpg','image/png','image/webp','image/gif'];
const MAX_SIZE_MB   = 10;

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'POST') return err('Method not allowed', 405);

  if (!env.R2) return err('R2 스토리지가 연결되지 않았습니다', 503);

  const session = await validateSession(request, env.DB);
  if (!session) return err('로그인이 필요합니다', 401);
  if (session.role !== 'admin') return err('관리자 권한이 필요합니다', 403);

  let formData;
  try { formData = await request.formData(); }
  catch (e) { return err('파일 파싱 실패: ' + e.message, 400); }

  const file   = formData.get('file');
  const prefix = formData.get('prefix') || 'media';
  const id     = formData.get('id') || crypto.randomUUID();

  if (!file) return err('file 필드가 없습니다', 400);
  if (!ALLOWED_TYPES.includes(file.type)) return err('이미지 파일(JPG/PNG/WebP/GIF)만 업로드할 수 있습니다', 400);
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return err(`파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다`, 400);

  const ext = file.type.split('/')[1].replace('jpeg','jpg');
  const key = `${prefix}/${id}/image.${ext}`;

  const buffer = await file.arrayBuffer();
  await env.R2.put(key, buffer, {
    httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=86400' },
    customMetadata: { originalName: file.name || 'image', uploadedAt: new Date().toISOString() },
  });

  return json({ ok: true, key, id }, 201);
}
