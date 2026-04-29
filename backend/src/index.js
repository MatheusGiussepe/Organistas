import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import organistasRoutes from './routes/organistas.js';

dotenv.config();

// ===== Validação das variáveis de ambiente =====
// Se algo estiver faltando, encerramos o processo com uma mensagem clara
// (em vez de deixar a API subir e quebrar com 500 a cada requisição).
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
  console.error('\n❌ Variáveis de ambiente faltando no backend/.env:');
  for (const k of missing) console.error(`   - ${k}`);
  console.error('\nDica: copie backend/.env.example -> backend/.env e preencha tudo.\n');
  process.exit(1);
}

const app = express();

// CORS - aceita lista de origens separadas por vírgula
const corsOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: corsOrigins.includes('*') ? true : corsOrigins,
  credentials: false,
}));

app.use(express.json({ limit: '1mb' }));

// Healthcheck simples
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/organistas', organistasRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

// Tratamento global de erros - em dev mostra a mensagem real
app.use((err, _req, res, _next) => {
  console.error('[erro]', err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    error: isProd ? 'Erro interno no servidor.' : (err.message || 'Erro interno'),
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🎵 API Organistas rodando em http://localhost:${PORT}`);
  console.log(`   Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`   Admin:       ${process.env.ADMIN_USERNAME}`);
  console.log(`   Visualizador: ${process.env.VIEWER_USERNAME}`);
  console.log(`   CORS origin: ${process.env.CORS_ORIGIN || '(todos)'}\n`);
});
