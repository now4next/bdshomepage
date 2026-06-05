/**
 * PUT /api/ebooks/multipart/chunk
 * Query: ?upload_id=X&key=Y&part_number=N
 * Body: 청크 raw binary (최대 10MB 권장)
 * 반환: { part_number, etag }
 *
 * R2 Multipart 파트 업로드.
 * 마지막 파트를 제외한 모든 파트는 5MB 이상이어야 한다.
 * 프론트에서 10MB 단위로 청크를 나눠 순서대로 호출한다.
 */
import { json, err, preflight } from '../../../_lib/cors.js';
import { validateSession } from '../../../_lib/auth.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'PUT') return err('Method not allowed', 405);

  if (!env.R2) return err('R2 스토리지가 연결되지 않았습니다', 503);

  const session = await validateSession(request, env.DB);
  if (!session) return err('로그인이 필요합니다', 401);
  if (session.role !== 'admin') return err('관리자 권한이 필요합니다', 403);

  const url = new URL(request.url);
  const uploadId   = url.searchParams.get('upload_id');
  const key        = url.searchParams.get('key');
  const partNumber = parseInt(url.searchParams.get('part_number'), 10);

  if (!uploadId || !key || isNaN(partNumber) || partNumber < 1 || partNumber > 10000) {
    return err('upload_id, key, part_number(1–10000) 파라미터가 필요합니다', 400);
  }

  const body = await request.arrayBuffer();
  if (!body.byteLength) return err('청크 데이터가 없습니다', 400);

  try {
    const upload = env.R2.resumeMultipartUpload(key, uploadId);
    const part = await upload.uploadPart(partNumber, body);
    return json({ part_number: part.partNumber, etag: part.etag });
  } catch (e) {
    return err('청크 업로드 실패: ' + e.message, 500);
  }
}
