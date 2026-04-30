<div align="center">

# 🎵 Lista de Organistas

<<<<<<< HEAD
**Sistema web para cadastrar, organizar e visualizar a lista de organistas, com login seguro e dois níveis de acesso.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

[Sobre](#-sobre-o-projeto) ·
[Funcionalidades](#-funcionalidades) ·
[Stack](#-stack-tecnológica) ·
[Como rodar](#-como-rodar-localmente) ·
[Deploy](#-deploy-na-vercel) ·
[Variáveis de ambiente](#-variáveis-de-ambiente)

</div>

---

## 📖 Sobre o projeto

Este projeto nasceu da necessidade de **organizar a lista de organistas** de forma mais prática do que uma planilha solta — com login, controle de acesso e duas formas de visualização (uma completa pra quem administra e outra simplificada pra leigos).

A ideia central é simples: **fácil de mexer, leve, bonito e seguro o bastante** pra ser usado pela comunidade.

🌐 **Demo online:** https://organistas.vercel.app

---

## ✨ Funcionalidades

- 🔐 **Login com sessão de 7 dias** — JWT salvo no navegador, expira automaticamente.
- 👥 **Dois perfis de acesso**:
  - **Administrador** — vê e edita a lista detalhada (CRUD completo).
  - **Visualizador** — acesso apenas à lista simplificada.
- 📋 **Tela detalhada** com tabela, busca, filtro por estado e modal de edição.
- 📱 **Tela simplificada** com cards agrupados por estado, fonte maior — pensada pra quem tem menos familiaridade com tecnologia.
- 🇧🇷 **Suporte completo aos 26 estados brasileiros + DF**, com normalização de acentos e correção de typos comuns.
- 🌍 **Categoria "INTERNACIONAL"** para organistas fora do Brasil — sempre exibida ao final da lista.
- 📊 **Importação automática** a partir de arquivo Excel (`.xlsx`).
- 🎨 **Visual delicado** com tons de rosa-blush e bordô, fonte Playfair Display, ícones musicais.
- 🚀 **Deploy unificado na Vercel** — frontend e backend num mesmo domínio, sem CORS.

---

## 🛠️ Stack tecnológica

| Camada | Tecnologias |
| --- | --- |
| **Frontend** | React 18 · Vite 5 · React Router 6 · CSS puro com variáveis |
| **Backend** | Node.js · Express 4 · JWT · express-rate-limit |
| **Banco de dados** | Supabase (Postgres gerenciado) |
| **Hospedagem** | Vercel (frontend + serverless function pro Express) |
| **Importação** | xlsx (SheetJS) |

---

## 🚀 Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+ instalado.
- Uma conta gratuita no [Supabase](https://supabase.com).

### 1. Clonar e instalar

```bash
git clone https://github.com/SEU-USUARIO/organistas.git
cd organistas
npm install
```

### 2. Criar o banco no Supabase

1. Crie um novo projeto em <https://supabase.com>.
2. Abra **SQL Editor → New query**, cole o conteúdo de [`supabase-schema.sql`](./supabase-schema.sql) e clique **Run**.
3. Em **Settings → API**, copie:
   - `Project URL` → será `SUPABASE_URL`.
   - `service_role` (chave secreta) → será `SUPABASE_SERVICE_ROLE_KEY`.

### 3. Configurar `.env`

```bash
cp .env.example .env
```

Preencha com os valores do passo anterior + JWT_SECRET aleatório (gere com `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) e usuários/senhas dos dois perfis.

### 4. Importar a planilha (opcional)

Se você tem o arquivo `lista-organistas.xlsx` em `scripts/`, basta:

```bash
npm run import
```

### 5. Rodar

```bash
npm run dev
```

Abra <http://localhost:5173> e faça login.

---

## ☁️ Deploy na Vercel

O projeto foi pensado pra rodar **inteiro num só deploy na Vercel** — frontend e backend convivem no mesmo domínio.

### Passo a passo

1. **Suba o código pro GitHub:**

   ```bash
   git add .
   git commit -m "primeira versão"
   git push origin main
   ```

2. **Conecte na Vercel:**
   - Acesse <https://vercel.com> → **Add new → Project**.
   - Selecione o repositório.
   - A Vercel detecta o Vite automaticamente — não mude as configs.

3. **Configure as variáveis de ambiente** (Settings → Environment Variables):

   | Variável | Exemplo |
   | --- | --- |
   | `SUPABASE_URL` | `https://xxx.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` |
   | `JWT_SECRET` | string aleatória longa |
   | `JWT_EXPIRES_IN` | `7d` |
   | `ADMIN_USERNAME` / `ADMIN_PASSWORD` | seu admin |
   | `VIEWER_USERNAME` / `VIEWER_PASSWORD` | seu visualizador |

4. **Deploy.** A URL final serve as telas (`/`) e a API (`/api/...`) no mesmo domínio.

> ⚠️ A importação da planilha (`npm run import`) **não roda na Vercel** (funções serverless são limitadas a poucos segundos). Rode local apontando o `.env` pro Supabase de produção, ou cole os dados direto no SQL Editor.

---

## 📁 Estrutura do projeto
=======
- **Login** com sessão de **7 dias** (token JWT salvo no navegador).
- **2 perfis fixos**:
  - `admin` → vê e edita a lista detalhada (CRUD completo).
  - `visualizador` → só vê a lista simplificada.
- **3 telas**: login, lista detalhada (admin) e lista simplificada.
- **Tema musical** suave (clave de sol, partitura, tons rosas).
- **Stack**: React + Vite (frontend) e Node.js + Express (backend) **no mesmo projeto**, deploy unificado na **Vercel** com **Supabase** (Postgres) como banco.
>>>>>>> a9ca4b99dab128815c31bd4058e62f9a1e214e54

```
organistas/
├── api/
│   └── index.js              # função serverless da Vercel (envelopa o Express)
├── server/
│   ├── app.js                # Express app (sem listen)
│   ├── routes/
│   │   ├── auth.js           # POST /api/auth/login, GET /api/auth/me
│   │   └── organistas.js     # CRUD em /api/organistas
│   ├── middleware/
│   │   └── auth.js           # requireAuth + requireAdmin (JWT)
│   └── db/
│       └── supabase.js       # cliente Supabase
├── scripts/
│   ├── devServer.js          # roda o Express localmente em :4000
│   ├── importExcel.js        # importa a planilha pro banco
│   └── lista-organistas.xlsx
├── src/                      # React (Vite)
│   ├── pages/                # Login, AdminList, SimpleList
│   ├── components/           # Layout, Modal, ProtectedRoute
│   ├── context/              # AuthContext (token + auto-login)
│   ├── api/                  # cliente HTTP com JWT
│   └── styles/               # CSS global (tema rosa)
├── index.html
├── vite.config.js
├── vercel.json               # roteamento /api/* + SPA fallback
├── package.json              # dependências do projeto inteiro
├── supabase-schema.sql
└── .env.example
```

<<<<<<< HEAD
---

## 🔑 Variáveis de ambiente

Todas configuradas no `.env` (local) ou no painel da Vercel (produção).

| Variável | Obrigatória | Descrição |
| --- | :---: | --- |
| `SUPABASE_URL` | ✅ | URL do projeto no Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Chave `service_role` (nunca exponha no frontend) |
| `JWT_SECRET` | ✅ | String aleatória usada para assinar tokens JWT |
| `JWT_EXPIRES_IN` | ❌ | Duração do token (padrão: `7d`) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | ✅ | Credenciais do administrador |
| `VIEWER_USERNAME` / `VIEWER_PASSWORD` | ✅ | Credenciais do visualizador |
| `PORT` | ❌ | Porta do backend local (padrão: `4000`) |
| `CORS_ORIGIN` | ❌ | Origens permitidas em CORS (padrão: `*`) |

---

## 🔐 Como funciona o login (resumo técnico)

1. `POST /api/auth/login` recebe `{ username, password }` e compara com as variáveis do `.env`.
2. Se baterem, devolve um **JWT** assinado com `JWT_SECRET`, validade `JWT_EXPIRES_IN`.
3. O frontend guarda o token em `localStorage` (`organistas_token`).
=======

## Como funciona o login (resumo técnico)

1. `POST /api/auth/login` recebe `{ username, password }` e compara com o `.env`.
2. Se baterem, devolve um **JWT** assinado com `JWT_SECRET`, validade `JWT_EXPIRES_IN` (padrão `7d`).
3. O frontend guarda esse token em `localStorage` (`organistas_token`).
>>>>>>> a9ca4b99dab128815c31bd4058e62f9a1e214e54
4. Em toda chamada à API, o cliente envia `Authorization: Bearer <token>`.
5. O middleware `requireAuth` valida o token a cada requisição; se expirou, o frontend desloga automaticamente.
6. Para rotas de escrita, o `requireAdmin` exige `role === 'admin'`.

---

## 🐛 Troubleshooting

| Sintoma | Causa provável / Solução |
| --- | --- |
| `Token inválido ou expirado` | Passou de 7 dias, ou `JWT_SECRET` foi trocado. Faça login novamente. |
| `Falha ao carregar` no frontend | Backend não rodou — confira o terminal do `npm run dev`. |
| Importação falha com `permission denied` | A chave usada precisa ser a `service_role`, não a `anon`. |
| `404 /api/...` em produção | Confira se o `vercel.json` está na raiz e tem o rewrite `/api/:path*`. |
| Tabela `organistas` não existe | Rode `supabase-schema.sql` no SQL Editor do Supabase. |
| `npm run dev` reclama de variáveis faltando | Crie `.env` a partir do `.env.example` e preencha tudo. |

---

## 👤 Autor

**Matheus Giussepe**

- GitHub: https://github.com/MatheusGiussepe
- E-mail: mgiussepe26@gmail.com

---

<div align="center">

🎵 _Feito com carinho para a Obra de Deus_ ♪ ♫ ♬

⭐ **Se este projeto te ajudou, deixe uma estrela!**

</div>
