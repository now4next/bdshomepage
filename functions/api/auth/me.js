/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Returns current user info (used by protected pages to verify session)
 */
import { validateSession } from '../../_lib/auth.js';
import { json, err, preflight } from '../../_lib/cors.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'GET') return err('Method not allowed', 405);

  const user = await validateSession(request, env.DB);
  if (!user) return err('인증이 필요합니다.', 401);

  return json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
