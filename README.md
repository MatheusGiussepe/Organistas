# Lista de Organistas

Sistema simples para gerenciar a Lista de Organistas com:

- **Login** com sessão de **7 dias** (token JWT salvo no navegador).
- **2 perfis fixos**:
  - `admin` → vê e edita a lista detalhada (CRUD completo).
  - `visualizador` → só vê a lista simplificada.
- **3 telas**: login, lista detalhada (admin) e lista simplificada.
- **Tema musical** suave (clave de sol, partitura, tons marfim/dourado/azul-noite).
- **Backend**: Node.js + Express + Supabase (Postgres).
- **Frontend**: React + Vite + React Router.

```
Organistas/
├── backend/                Node.js + Express + Supabase
│   └── src/
│       ├── index.js
│       ├── routes/         auth.js, organistas.js
│       ├── middleware/     auth.js (JWT)
│       ├── db/             supabase.js
│       └── scripts/        importExcel.js + lista-organistas.xlsx
├── frontend/               React + Vite
│   └── src/
│       ├── pages/          Login.jsx, AdminList.jsx, SimpleList.jsx
│       ├── components/     Layout.jsx, ProtectedRoute.jsx
│       ├── context/        AuthContext.jsx
│       ├── api/            client.js
│       └── styles/         global.css
├── supabase-schema.sql     SQL para criar a tabela
└── README.md               (você está aqui)
```

---

## ⚡ Caminho rápido (depois que tudo já está configurado)

Na **primeira vez** (instala dependências dos dois projetos de uma vez):

```bash
npm run install:all
```

Pra **rodar o sistema** (sobe backend + frontend juntos num único terminal):

```bash
npm run dev
```

Você vai ver duas colunas no terminal: `[API]` (backend, amarelo) e `[WEB]` (frontend, ciano), rodando ao mesmo tempo. Abra <http://localhost:5173> no navegador. Pra parar, **Ctrl+C** no terminal — ele encerra os dois juntos.

> ⚠️ Esse comando pressupõe que você já fez o setup do `.env` do backend e do banco no Supabase. Se ainda não, siga o **Passo a passo** logo abaixo.

---

## Passo a passo (no Cursor)

### 1. Criar projeto no Supabase

1. Vá em <https://supabase.com> → **New project**.
2. Quando o projeto subir, abra **SQL Editor → New query**, cole o conteúdo de
   [`supabase-schema.sql`](./supabase-schema.sql) e clique **Run**.
3. Em **Settings → API** copie:
   - `Project URL` → vai em `SUPABASE_URL`.
   - `service_role` (a chave secreta) → vai em `SUPABASE_SERVICE_ROLE_KEY`.
   > A `service_role` **não** deve ser exposta no frontend; ela é usada **apenas** pelo backend.

### 2. Backend (API)

```bash
cd backend
npm install
cp .env.example .env       # no Windows: copy .env.example .env
```

Abra `backend/.env` e preencha:

- `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (do passo 1).
- `JWT_SECRET` → string longa e aleatória. Sugestão:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` → credenciais do admin.
- `VIEWER_USERNAME` / `VIEWER_PASSWORD` → credenciais do visualizador.

#### Importar a planilha (rodar uma única vez)

A planilha já está copiada em `backend/src/scripts/lista-organistas.xlsx`.

```bash
npm run import
```

Saída esperada:

```
📖 Lendo planilha: .../lista-organistas.xlsx
✅ 350 registros prontos para importar.
🧹 Limpando tabela "organistas" antes de inserir...
  -> 350/350
🎉 Importação concluída com sucesso.
```

> Para **adicionar** sem apagar o que já existe: `npm run import -- --append`.
> Para usar **outro arquivo**: `npm run import -- caminho/da/planilha.xlsx`.

#### Rodar a API

```bash
npm run dev          # com auto-reload (nodemon)
# ou
npm start            # produção
```

A API sobe em `http://localhost:4000`. Teste: <http://localhost:4000/api/health>.

### 3. Frontend (React)

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env       # no Windows: copy .env.example .env
npm run dev
```

Abra <http://localhost:5173> e faça login com as credenciais que você definiu no `.env` do backend.

> Em desenvolvimento, o Vite faz proxy de `/api` para `http://localhost:4000`,
> então você não precisa preencher `VITE_API_URL` enquanto roda local.

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

## Deploy (Vercel + Supabase)

### Backend → Railway / Render (recomendado)

A Vercel também roda Node.js, mas para um Express tradicional o caminho mais
simples é hospedar o backend em [Railway](https://railway.app) ou [Render](https://render.com)
(ambos têm plano grátis).

1. Faça push do repositório no GitHub.
2. Em Railway/Render, **New service → Deploy from GitHub** → selecione a pasta `backend/`.
3. Configure as variáveis de ambiente (mesmas do `.env`).
4. Comando de start: `npm start`. Porta: a plataforma define via `PORT` (já é lido pelo código).
5. Anote a URL pública (ex.: `https://organistas-api.up.railway.app`).

### Frontend → Vercel

1. Em <https://vercel.com> → **Add new → Project** → selecione o repo, e na hora de configurar
   defina **Root Directory = `frontend`**.
2. Em **Environment variables**, adicione:
   - `VITE_API_URL` = URL pública do backend (ex.: `https://organistas-api.up.railway.app`).
3. Build command: `npm run build`. Output: `dist`.
4. No backend, atualize `CORS_ORIGIN` para incluir o domínio da Vercel
   (ex.: `https://organistas.vercel.app`).

---

## Como adicionar mais usuários depois

O sistema atual é proposital: 2 perfis fixos, controlados pelo `.env`. Se um dia precisar de
mais usuários, dá pra evoluir em duas direções:

- **Lista de usuários no `.env`** (ex.: `USERS_JSON='[{"u":"maria","p":"...","role":"admin"}]'`)
  — simples, sem banco extra.
- **Tabela `usuarios` no Supabase** com senhas em **bcrypt** — mais robusto, com cadastro/edição
  pela interface do admin.

Avise se quiser que eu evolua nessa direção.

---

## Troubleshooting

| Sintoma                                      | Causa provável / Solução                                                |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `Token inválido ou expirado`                 | Passou de 7 dias, ou `JWT_SECRET` foi trocado. Faça login de novo.      |
| `Falha ao carregar` no frontend              | Backend não está rodando, ou `VITE_API_URL`/proxy mal configurado.      |
| Importação falha com "permission denied"     | A chave usada no `.env` precisa ser a `service_role`, não a `anon`.     |
| `CORS error` no console                      | Adicione o domínio do frontend em `CORS_ORIGIN` no `.env` do backend.   |
| Tabela "organistas" não existe               | Rode `supabase-schema.sql` no SQL Editor do Supabase.                   |

---

🎵 Bom uso! ♪ ♫ ♬
