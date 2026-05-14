/**
 * POST /api/contacts   — 누구나: 문의 제출 (index.html 폼)
 * GET  /api/contacts   — admin 전용: 문의 목록 조회
 */
import { validateSession } from '../_lib/auth.js';
import { json, err, preflight } from '../_lib/cors.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return preflight();

  const db = env.DB;

  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return err('Invalid JSON'); }

    const { fullName, email, phone, country, gradeLevel, inquiryType, contactMethod, message, emailSent } = body;
    if (!fullName || !email) return err('이름과 이메일은 필수입니다.');

    const id = crypto.randomUUID();
    await db.prepare(`
      INSERT INTO contact_submissions
        (id, full_name, email, phone, country, grade_level, inquiry_type, contact_method, message, email_sent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      fullName || '',
      email || '',
      phone || '',
      country || '',
      gradeLevel || '',
      inquiryType || '',
      contactMethod || '',
      message || '',
      emailSent ? 1 : 0
    ).run();

    return json({ ok: true, id }, 201);
  }

  if (request.method === 'GET') {
    const user = await validateSession(request, db);
    if (!user || user.role !== 'admin') return err('관리자 권한이 필요합니다.', 403);

    const rows = await db.prepare(
      'SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 200'
    ).all();
    return json({ submissions: rows.results || [] });
  }

  return err('Method not allowed', 405);
}
