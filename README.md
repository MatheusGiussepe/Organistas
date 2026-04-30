# Lista de Organistas

Sistema simples para gerenciar a Lista de Organistas com:

- **Login** com sessão de **7 dias** (token JWT salvo no navegador).
- **2 perfis fixos**:
  - `admin` → vê e edita a lista detalhada (CRUD completo).
  - `visualizador` → só vê a lista simplificada.
- **3 telas**: login, lista detalhada (admin) e lista simplificada.
- **Tema musical** suave (clave de sol, partitura, tons rosas).
- **Stack**: React + Vite (frontend) e Node.js + Express (backend) **no mesmo projeto**, deploy unificado na **Vercel** com **Supabase** (Postgres) como banco.

```
Organistas/
├── api/
│   └── index.js              ← função serverless da Vercel (rotaeia /api/* pro Express)
├── server/
│   ├── app.js                ← app Express (sem listen)
│   ├── routes/               ← auth.js, organistas.js
│   ├── middleware/auth.js    ← verificação de JWT
│   └── db/supabase.js        ← cliente do Supabase
├── scripts/
│   ├── devServer.js          ← roda o Express localmente em :4000
│   ├── importExcel.js        ← importa a planilha pro banco
│   └── lista-organistas.xlsx
├── src/                      ← React (Vite)
│   ├── pages/, components/, context/, api/, styles/
│   ├── App.jsx, main.jsx
├── index.html
├── vite.config.js
├── vercel.json               ← roteamento /api/* e SPA fallback
├── package.json              ← UM só, com tudo
├── .env.example
├── supabase-schema.sql
└── README.md
```


## Como funciona o login (resumo técnico)

1. `POST /api/auth/login` recebe `{ username, password }` e compara com o `.env`.
2. Se baterem, devolve um **JWT** assinado com `JWT_SECRET`, validade `JWT_EXPIRES_IN` (padrão `7d`).
3. O frontend guarda esse token em `localStorage` (`organistas_token`).
4. Em toda chamada à API, o cliente envia `Authorization: Bearer <token>`.
5. O middleware `requireAuth` valida o token; se expirou, o frontend desloga
   automaticamente e manda pra `/login`.
6. Para rotas de escrita, o middleware `requireAdmin` exige `role === 'admin'`.

---

## Troubleshooting

| Sintoma                                      | Causa provável / Solução                                                |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `Token inválido ou expirado`                 | Passou de 7 dias, ou `JWT_SECRET` foi trocado. Faça login de novo.      |
| `Falha ao carregar` no frontend              | Backend não rodou — confira o terminal do `npm run dev`.                |
| Importação falha com "permission denied"     | A chave usada no `.env` precisa ser a `service_role`, não a `anon`.     |
| `404 /api/...` em produção                   | Confira se o `vercel.json` está na raiz e tem o rewrite `/api/:path*`.  |
| Tabela "organistas" não existe               | Rode `supabase-schema.sql` no SQL Editor do Supabase.                   |
| `npm run dev` reclama de variáveis faltando  | Crie `.env` a partir do `.env.example` e preencha tudo.                 |

---

🎵 Bom uso! ♪ ♫ ♬
