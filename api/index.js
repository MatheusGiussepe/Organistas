// Função serverless da Vercel.
// O Express é, ele mesmo, um handler (req, res) -> void, então basta exportar o app.
// Configuração de roteamento de /api/* -> esta função fica em vercel.json.
import app from '../server/app.js';
export default app;
