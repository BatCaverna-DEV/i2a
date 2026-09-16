# Backend — Grupo de Pesquisa I2A

API REST em Node.js (ES6 Modules) + Express + Sequelize + MariaDB, com autenticação
JWT em duas etapas usando o Google Authenticator (TOTP).

## Estrutura

```
backend/
├── index.js          ← servidor Express (arquivo principal)
├── package.json      ← "type": "module"
├── .env / .env.example
├── config/           ← env.js (leitura do .env) e database.js (Sequelize)
├── models/           ← um model por tabela do DER + index.js com as associações
├── controllers/      ← um por recurso + crudFactory.js (CRUD genérico)
├── routes/           ← index.js → auth, publico, admin (admin/ tem um arquivo por recurso)
└── helpers/          ← middlewares, services, validações e utilitários
```

O que vive em `helpers/`:

| Arquivo | Papel |
|---|---|
| `auth.js` | middlewares `autenticar`, `autorizar`, `donoOuAdmin` |
| `validate.js` | validação das requisições com Zod |
| `rateLimit.js` | limite de tentativas nas rotas de login |
| `errorHandler.js` | resposta de erro padronizada + 404 |
| `authService.js`, `tokenService.js`, `totpService.js` | regras do login em duas etapas |
| `authSchemas.js`, `entidadeSchemas.js` | schemas Zod |
| `ApiError.js`, `asyncHandler.js`, `paginacao.js` | utilitários |
| `sync.js`, `seed.js` | scripts de banco (`npm run db:sync` / `db:seed`) |

## Como rodar

```bash
cd backend
npm install
cp .env.example .env     # preencha as credenciais e os segredos JWT
npm run db:sync          # cria as tabelas a partir dos models
npm run db:seed          # cria o usuário administrador inicial
npm run dev              # sobe em http://localhost:3000/api
```

Gere os segredos JWT com:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Fluxo de login

1. `POST /api/auth/login` com `{ username, senha }`
   → devolve `mfaToken` e, no primeiro acesso, o `qrCode` do Google Authenticator.
2. `POST /api/auth/verificar` com `{ mfaToken, codigo }`
   → devolve `accessToken`, `refreshToken` e os dados do usuário.
3. Envie `Authorization: Bearer <accessToken>` nas rotas `/api/admin/*`.

A descrição completa da arquitetura está em `../sistema.md`.
