/**
 * GET /api/ebooks/:id/stream
 * 인증된 사용자에게 R2의 PDF 파일을 스트리밍.
 * URL이 외부에 노출되지 않으므로 직접 다운로드 불가.
 */
import { err, preflight } from '../../../_lib/cors.js';
import { validateSession } from '../../../_lib/auth.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization',
};

function canAccess(userRole, requiredRole) {
  if (!userRole) return false;
  if (userRole === 'admin') return true;
  if (requiredRole === 'member' && userRole === 'member') return true;
  return false;
}

export async function onRequest({ request, env, params }) {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'GET') return err('Method not allowed', 405);

  /* 인증 */
  const session = await validateSession(request, env.DB);
  if (!session) return err('로그인이 필요합니다', 401);

  /* 전자책 조회 */
  const ebook = await env.DB.prepare(
    `SELECT id, r2_key, required_role FROM ebooks WHERE id = ? AND is_active = 1`
  ).bind(params.id).first();

  if (!ebook) return err('찾을 수 없습니다', 404);

  /* 권한 확인 */
  if (!canAccess(session.role, ebook.required_role)) {
    return err('열람 권한이 없습니다', 403);
  }

  /* R2에서 스트리밍 */
  const obj = await env.R2.get(ebook.r2_key);
  if (!obj) return err('파일이 없습니다', 404);

  return new Response(obj.body, {
    headers: {
      ...CORS,
      'Content-Type': 'application/pdf',
      'Content-Length': String(obj.size),
      'Content-Disposition': 'inline; filename="ebook.pdf"',
      'Cache-Control': 'private, no-store, no-cache',
      'X-Content-Type-Options': 'nosniff',
      /* 다운로드 방지 추가 헤더 */
      'Content-Security-Policy': "default-src 'none'",
    },
  });
}
