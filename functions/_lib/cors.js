/**
 * BDS API — Response helpers & CORS
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export function err(message, status = 400) {
  return json({ error: message }, status);
}

export function preflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
