// Servidor local de desenvolvimento.
// Em produção (Vercel) este arquivo NÃO roda - lá usamos o api/index.js como serverless.
import app from '../server/app.js';

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🎵 API Organistas (dev) em http://localhost:${PORT}`);
  console.log(`   Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`   Admin:        ${process.env.ADMIN_USERNAME}`);
  console.log(`   Visualizador: ${process.env.VIEWER_USERNAME}\n`);
});
