/**
 * POST /api/ebooks/multipart/complete
 * body (JSON): { upload_id, key, parts: [{part_number, etag}] }
 * 반환: { ok, key, ebook_id }
 *
 * R2 Multipart Upload 완료 — 모든 청크가 올라간 뒤 최종화한다.
 * 실패 시 업로드를 abort 처리한다.
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

  const { upload_id, key, parts } = await request.json();

  if (!upload_id || !key || !Array.isArray(parts) || !parts.length) {
    return err('upload_id, key, parts 가 필요합니다', 400);
  }

  const upload = env.R2.resumeMultipartUpload(key, upload_id);

  try {
    await upload.complete(
      parts.map(p => ({ partNumber: p.part_number, etag: p.etag }))
    );
  } catch (e) {
    // 완료 실패 시 중단 처리 (R2 임시 데이터 정리)
    try { await upload.abort(); } catch {}
    return err('멀티파트 업로드 완료 실패: ' + e.message, 500);
  }

  // key 형식: ebooks/{ebook_id}/original.pdf
  const ebookId = key.split('/')[1];
  return json({ ok: true, key, ebook_id: ebookId });
}
