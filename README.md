# Lista de Organistas

Sistema simples para gerenciar a Lista de Organistas com:

- **Login** com sessão de **7 dias** (token JWT salvo no navegador).
- **2 perfis fixos**:
  - `admin` → vê e edita a lista detalhada (CRUD completo).
  - `visualizador` → só vê a lista simplificada.
- **3 telas**: login, lista detalhada (admin) e lista simplificada.
- **Tema musical** suave (clave de sol, partitura, tons marfim/dourado/azul-noite).
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

> ⚠️ **Migração v2:** se você ainda vê pastas antigas `backend/` e `frontend/`,
> apague elas (no Cursor: clique direito → Delete) junto com o `node_modules/`
> antigo e o `package-lock.json`. Depois rode `npm install` na raiz.

---

## ⚡ Caminho rápido

Na **primeira vez** (instala dependências):

```bash
npm install
```

Pra **rodar o sistema** (sobe backend + frontend juntos num único terminal):

```bash
npm run dev
```

Você vai ver duas colunas no terminal: `[API]` (Express, amarelo) e `[WEB]` (Vite, ciano).
Abra <http://localhost:5173> no navegador. Pra parar, **Ctrl+C** — encerra os dois juntos.

> Pressupõe que você já fez o setup do `.env` e do banco no Supabase. Se ainda não, siga abaixo.

---

## Setup completo (passo a passo)

### 1. Criar projeto no Supabase

1. Vá em <https://supabase.com> → **New project**.
2. Quando o projeto subir, abra **SQL Editor → New query**, cole o conteúdo de
   [`supabase-schema.sql`](./supabase-schema.sql) e clique **Run**.
3. Em **Settings → API** copie:
   - `Project URL` → vai em `SUPABASE_URL`.
   - `service_role` (a chave secreta) → vai em `SUPABASE_SERVICE_ROLE_KEY`.

   > A `service_role` **não** deve ser exposta no frontend; ela é usada **apenas** pelo backend.

### 2. Configurar `.env`

```bash
cp .env.example .env       # no Windows: copy .env.example .env
```

Abra `.env` e preencha:

- `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (do passo 1).
- `JWT_SECRET` → string longa e aleatória. Sugestão:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` → credenciais do admin.
- `VIEWER_USERNAME` / `VIEWER_PASSWORD` → credenciais do visualizador.

### 3. Importar a planilha (rodar uma única vez)

A planilha já está em `scripts/lista-organistas.xlsx`.

```bash
npm run import
```

Saída esperada:

```
📖 Lendo planilha: .../scripts/lista-organistas.xlsx
✅ 218 registros prontos para importar.
🧹 Limpando tabela "organistas" antes de inserir...
  -> 218/218
🎉 Importação concluída com sucesso.
```

> Para **adicionar** sem apagar o que já existe: `npm run import -- --append`.
> Para usar **outro arquivo**: `npm run import -- caminho/da/planilha.xlsx`.

### 4. Rodar localmente

```bash
npm install
npm run dev
```

API: <http://localhost:4000/api/health> &nbsp;·&nbsp; Site: <http://localhost:5173>

---

## 🚀 Deploy na Vercel (frontend + backend juntos)

### 1. Subir o código pro GitHub

```bash
git init        # se ainda não for um repo
git add .
git commit -m "primeira versao"
# crie um repo no github.com e:
git remote add origin https://github.com/SEU-USUARIO/organistas.git
git push -u origin main
```

### 2. Importar na Vercel

1. Vá em <https://vercel.com> → **Add new → Project**.
2. Selecione o repositório do GitHub.
3. Em **Configure**: a Vercel detecta o Vite automaticamente. Não precisa mudar nada.
4. Em **Environment variables**, adicione **as mesmas do `.env`**:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` (`7d`)
   - `ADMIN_USERNAME` e `ADMIN_PASSWORD`
   - `VIEWER_USERNAME` e `VIEWER_PASSWORD`
5. Clique **Deploy**.

Pronto. A URL final (ex.: `https://organistas.vercel.app`) serve **as telas**, e
`https://organistas.vercel.app/api/...` é o **backend**, no mesmo domínio. Sem CORS, sem deploy duplo.

### 3. Importar a planilha pro Supabase de produção

Continue rodando localmente, apontando o `.env` pro mesmo Supabase usado em produção:

```bash
npm run import
```

Funções serverless da Vercel **não** são apropriadas pra rodar import de planilha (são limitadas a poucos segundos), por isso fazemos isso da sua máquina mesmo. É só garantir que o `.env` aponte pra `SUPABASE_URL` certa.

---

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
