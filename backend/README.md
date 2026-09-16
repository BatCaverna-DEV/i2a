# Backend — Grupo de Pesquisa I2A

API REST em Node.js (ES6 Modules) + Express + Sequelize + MariaDB.
A autenticação é feita por **conta Google** — o sistema não armazena senha.

## Estrutura

```
backend/
├── index.js          ← servidor Express (arquivo principal)
├── package.json      ← "type": "module"
├── .env / .env.example
├── config/           ← env.js (leitura do .env) e database.js (Sequelize)
├── models/           ← um model por tabela do DER + index.js com as associações
├── controllers/      ← um por recurso + crudFactory.js (CRUD genérico)
├── routes/           ← index.js → auth, publico, admin (admin/ tem um por recurso)
└── helpers/          ← middlewares, services, validações e utilitários
```

O que vive em `helpers/`:

| Arquivo | Papel |
|---|---|
| `auth.js` | middlewares `autenticar`, `autorizar`, `donoOuAdmin` |
| `googleService.js` | valida o ID token do Google (assinatura, emissor, `aud`) |
| `authService.js` | regras do login: whitelist, vínculo da conta, emissão dos JWT |
| `tokenService.js` | emissão e verificação dos tokens da aplicação |
| `validate.js` | validação das requisições com Zod |
| `rateLimit.js` | limite de tentativas na rota de login |
| `errorHandler.js` | resposta de erro padronizada + 404 |
| `authSchemas.js`, `entidadeSchemas.js` | schemas Zod |
| `ApiError.js`, `asyncHandler.js`, `paginacao.js` | utilitários |
| `seed.js` | cria as tabelas e popula os dados iniciais (`npm run db`) |

## Configurar o Google

1. Acesse o **Google Cloud Console** → *APIs e Serviços* → *Credenciais*.
2. Crie um **ID do cliente OAuth 2.0** do tipo *Aplicativo da Web*.
3. Em **Origens JavaScript autorizadas**, informe a URL do frontend:
   `http://localhost:5173` em desenvolvimento e o domínio real em produção.
   Não é preciso configurar URI de redirecionamento.
4. Copie o **Client ID** para `GOOGLE_CLIENT_ID` (backend) e
   `VITE_GOOGLE_CLIENT_ID` (frontend) — tem que ser o mesmo valor.
5. Em *Tela de permissão OAuth*, preencha os dados do grupo. Enquanto o app
   estiver em modo "Teste", só as contas listadas como usuários de teste conseguem
   entrar.

O **Client Secret não é usado** neste fluxo.

## Como rodar

```bash
cd backend
npm install
cp .env.example .env     # preencha banco, GOOGLE_CLIENT_ID e SEED_ADMIN_EMAIL
npm run db               # cria as tabelas e autoriza o e-mail do administrador
npm run dev              # sobe em http://localhost:3000/api
```

Gere os segredos JWT com:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Fluxo de login

1. O frontend mostra o botão do Google e recebe um **ID token**.
2. `POST /api/auth/google` com `{ credential }` — a API confere a assinatura do
   token com as chaves públicas do Google e o `aud` com o nosso Client ID.
3. O e-mail do token é procurado na tabela `usuarios`. **Quem não estiver
   cadastrado é recusado**, mesmo com conta Google válida.
4. No primeiro acesso o `google_sub` fica gravado, travando o vínculo.
5. A API devolve `accessToken` e `refreshToken` próprios; as rotas
   `/api/admin/*` usam `Authorization: Bearer <accessToken>`.

Para autorizar mais alguém: **Painel → Usuários → Novo**, informando o e-mail
exato da conta Google.

A descrição completa da arquitetura está em `../sistema.md`.
