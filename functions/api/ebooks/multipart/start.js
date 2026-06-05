/**
 * POST /api/ebooks/multipart/start
 * body (JSON): { ebook_id? }
 * 반환: { upload_id, key, ebook_id }
 *
 * R2 Multipart Upload 시작 — 업로드 세션을 열고 uploadId를 반환한다.
 * 이후 /chunk 로 청크를 올리고 /complete 로 최종화한다.
 */
import { json, err, preflight } from '../../../_lib/cors.js';
import { validateSession } from '../../../_lib/auth.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'POST') return err('Method not allowed', 405);

  if (!env.R2) return err('R2 스토리지가 연결되지 않았습니다', 503);

  const session = await validateSession(request, env.DB);
  if (!session) return err('로그인이 필요합니다', 401);
  if (session.role !== 'admin') return err('관리자 권한이 필요합니다', 403);

  const { ebook_id } = await request.json().catch(() => ({}));
  const ebookId = ebook_id || crypto.randomUUID();
  const key = `ebooks/${ebookId}/original.pdf`;

  const upload = await env.R2.createMultipartUpload(key, {
    httpMetadata: { contentType: 'application/pdf' },
    customMetadata: { uploadedAt: new Date().toISOString() },
  });

  return json({ upload_id: upload.uploadId, key, ebook_id: ebookId }, 201);
}
