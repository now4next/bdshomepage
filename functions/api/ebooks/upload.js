/**
 * POST /api/ebooks/upload
 * multipart/form-data:
 *   file       — PDF 또는 이미지 (Blob)
 *   type       — 'pdf' | 'thumbnail'  (기본: 'pdf')
 *   ebook_id   — 이미 알고 있는 경우 전달, 없으면 새 UUID 생성
 *
 * 반환: { ok, key, ebook_id }
 */
import { json, err, preflight } from '../../_lib/cors.js';
import { validateSession } from '../../_lib/auth.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'POST') return err('Method not allowed', 405);

  const session = await validateSession(request, env.DB);
  if (!session) return err('로그인이 필요합니다', 401);
  if (session.role !== 'admin') return err('관리자 권한이 필요합니다', 403);

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return err('multipart/form-data 형식으로 전송해주세요', 400);
  }

  const file = formData.get('file');
  if (!file) return err('file 필드가 없습니다', 400);

  const type = formData.get('type') || 'pdf';
  const ebookId = formData.get('ebook_id') || crypto.randomUUID();

  const ext = type === 'thumbnail' ? 'jpg' : 'pdf';
  const contentType = type === 'thumbnail' ? 'image/jpeg' : 'application/pdf';
  const key = `ebooks/${ebookId}/${type === 'thumbnail' ? 'thumbnail' : 'original'}.${ext}`;

  await env.R2.put(key, file.stream(), {
    httpMetadata: { contentType },
  });

  return json({ ok: true, key, ebook_id: ebookId }, 201);
}
