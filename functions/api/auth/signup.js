/**
 * POST /api/auth/signup
 * Body: { name, email, password }
 */
import { hashPassword, generateToken, sessionExpiresAt } from '../../_lib/auth.js';
import { json, err, preflight } from '../../_lib/cors.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'POST') return err('Method not allowed', 405);

  const db = env.DB;
  let body;
  try { body = await request.json(); } catch { return err('Invalid JSON'); }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  if (!name || !email || !password) return err('이름, 이메일, 비밀번호를 모두 입력해주세요.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('올바른 이메일 형식이 아닙니다.');
  if (password.length < 8) return err('비밀번호는 8자 이상이어야 합니다.');

  // Duplicate check
  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return err('이미 등록된 이메일입니다.', 409);

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await db.prepare(
    'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, name, email, passwordHash, 'member').run();

  // Auto-login: create session
  const token = generateToken();
  const expiresAt = sessionExpiresAt();
  await db.prepare(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
  ).bind(token, id, expiresAt).run();

  return json({ token, user: { id, name, email, role: 'member' } }, 201);
}
