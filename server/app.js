import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import organistasRoutes from './routes/organistas.js';

// Em dev/local lê o .env do projeto. Na Vercel as variáveis vêm injetadas pela própria plataforma.
dotenv.config();

// ===== Validação das variáveis de ambiente =====
// Em ambiente serverless (Vercel), em vez de dar process.exit, só logamos o aviso —
// pra não derrubar a função em cold start. Localmente, queremos parar o processo cedo.
const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'VIEWER_USERNAME',
  'VIEWER_PASSWORD',
];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  const msg = `Variáveis de ambiente faltando: ${missing.join(', ')}`;
  if (process.env.VERCEL) {
    console.error(`[env] ${msg}`);
  } else {
    console.error('\n❌ ' + msg);
    console.error('Dica: copie .env.example -> .env e preencha tudo.\n');
    process.exit(1);
  }
}

const app = express();

// CORS - aceita lista de origens separadas por vírgula.
// Na Vercel, frontend e backend ficam no mesmo domínio, então CORS basicamente não importa.
const corsOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: corsOrigins.includes('*') ? true : corsOrigins,
  credentials: false,
}));

app.use(express.json({ limit: '1mb' }));

// Rate-limit / proxy: a Vercel é um proxy, então confiamos nos headers.
// Sem isso, o express-rate-limit reclama no log.
app.set('trust proxy', 1);

// Healthcheck simples
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString(), env: process.env.VERCEL ? 'vercel' : 'local' })
);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/organistas', organistasRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

// Tratamento global de erros - em dev mostra a mensagem real
app.use((err, _req, res, _next) => {
  console.error('[erro]', err);
  const isProd = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV?.startsWith('preview');
  res.status(500).json({
    error: isProd ? 'Erro interno no servidor.' : (err.message || 'Erro interno'),
  });
});

export default app;
