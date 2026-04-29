/**
 * Cliente HTTP simples que injeta o token JWT em todas as chamadas
 * e trata respostas de erro de forma consistente.
 */

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getToken() {
  return localStorage.getItem('organistas_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('organistas_token', token);
  else localStorage.removeItem('organistas_token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Token expirado/ausente → força logout
    setToken(null);
    window.dispatchEvent(new Event('organistas:logout'));
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  let body = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) body = await res.json();
  else if (res.status !== 204) body = await res.text();

  if (!res.ok) {
    const msg = body?.error || (typeof body === 'string' ? body : 'Erro na requisição.');
    throw new Error(msg);
  }
  return body;
}

export const api = {
  get:    (p)         => request(p),
  post:   (p, body)   => request(p, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (p, body)   => request(p, { method: 'PUT',    body: JSON.stringify(body) }),
  del:    (p)         => request(p, { method: 'DELETE' }),
};
