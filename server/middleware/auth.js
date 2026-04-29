import jwt from 'jsonwebtoken';

/**
 * Middleware: valida o JWT enviado no header Authorization: Bearer <token>.
 * Em caso de sucesso, anexa o payload em req.user = { username, role }.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token ausente. Faça login novamente.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado. Faça login novamente.' });
  }
}

/**
 * Middleware: exige que o usuário seja admin.
 * Use depois de requireAuth.
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Apenas o administrador pode realizar esta ação.' });
  }
  return next();
}
