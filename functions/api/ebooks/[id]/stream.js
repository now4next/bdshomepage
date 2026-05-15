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

async function canAccess(userId, userRole, ebookId, requiredRole, db) {
  if (!userRole) return false;
  if (userRole === 'admin') return true;

  // 사용자별 개별 재정의 확인 (관리자가 명시적으로 허용/차단한 경우)
  const override = await db.prepare(
    `SELECT can_access FROM user_ebook_access WHERE user_id = ? AND ebook_id = ?`
  ).bind(userId, ebookId).first();

  if (override !== null) return Boolean(override.can_access);

  // 개별 설정 없으면 role 기반 기본값
  return requiredRole === 'member' && userRole === 'member';
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

  /* 권한 확인 (개별 재정의 → role 기본값 순서) */
  if (!await canAccess(session.id, session.role, ebook.id, ebook.required_role, env.DB)) {
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
