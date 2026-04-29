import { Router } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = Router();

// Limita tentativas de login (anti força-bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,                  // 20 tentativas por janela
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

/**
 * POST /api/auth/login
 * body: { username, password }
 * Retorna { token, user: { username, role } }
 */
router.post('/login', loginLimiter, (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const {
      ADMIN_USERNAME,
      ADMIN_PASSWORD,
      VIEWER_USERNAME,
      VIEWER_PASSWORD,
      JWT_SECRET,
      JWT_EXPIRES_IN = '7d',
    } = process.env;

    if (!JWT_SECRET) {
      console.error('[auth] JWT_SECRET ausente no .env');
      return res.status(500).json({ error: 'Configuração inválida no servidor (JWT_SECRET ausente).' });
    }

    let role = null;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      role = 'admin';
    } else if (username === VIEWER_USERNAME && password === VIEWER_PASSWORD) {
      role = 'viewer';
    }

    if (!role) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      token,
      user: { username, role },
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (err) {
    console.error('[auth/login] falhou:', err);
    return res.status(500).json({ error: err.message || 'Erro ao gerar token.' });
  }
});

/**
 * GET /api/auth/me
 * Verifica se o token enviado ainda é válido (usado no auto-login).
 */
router.get('/me', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Sem token.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ user: { username: payload.username, role: payload.role } });
  } catch {
    return res.status(401).json({ error: 'Token inválido.' });
  }
});

export default router;
