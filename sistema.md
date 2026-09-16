# Sistema do Grupo de Pesquisa I2A

Documentação da estrutura do site do **Grupo de Pesquisa I2A — Inteligência Artificial e
Aplicações** (IFMA, Campus Coelho Neto).

O sistema tem duas faces sobre a mesma base de dados:

| Face | Público | Endereço | O que faz |
|---|---|---|---|
| **Administrativa** | membros do grupo | `/admin` | cadastra pesquisadores, linhas, projetos, cursos e produção científica |
| **Pública** | visitantes externos | `/` | exibe o que foi cadastrado, sem autenticação |

---

## 1. Visão geral da arquitetura

```
Navegador
   │
   ├── /            → SPA Vue 3 (site público)   ──┐
   └── /admin       → SPA Vue 3 (painel)         ──┤  axios + JWT
                                                   │
                                          API REST Express
                                                   │
                                            Sequelize (ORM)
                                                   │
                                               MariaDB
```

- **Backend:** Node.js (ES6 Modules) + Express + Sequelize + MariaDB
- **Autenticação:** JWT em duas etapas, com segundo fator TOTP (Google Authenticator)
- **Frontend:** Vue 3 (Composition API, `<script setup>`) + Vite + Vue Router + Pinia + bootstrap-vue-next (Bootstrap 5)
- **Segredos:** arquivo `.env` em cada lado, nunca versionado (veja os `.env.example`)

---

## 2. Estrutura de pastas

```
i2a/
├── sistema.md                 ← este documento
├── LICENSE
├── README.md
│
├── backend/
│   ├── DER.png                ← diagrama entidade-relacionamento de origem
│   ├── index.js               ← ARQUIVO PRINCIPAL: monta o Express e sobe o servidor
│   ├── package.json           ← "type": "module" (ES6 Modules)
│   ├── .env / .env.example    ← variáveis sensíveis (o .env não é versionado)
│   ├── .gitignore
│   ├── README.md
│   │
│   ├── config/
│   │   ├── env.js             ← leitura única do .env
│   │   └── database.js        ← instância do Sequelize (MariaDB)
│   │
│   ├── models/
│   │   ├── index.js           ← registra models e declara as associações
│   │   ├── Usuario.js     ├── Pesquisador.js  ├── Linha.js
│   │   ├── Titulacao.js   ├── Curso.js        ├── Projeto.js
│   │   ├── Orientacao.js  ├── Producao.js     └── Autor.js
│   │
│   ├── controllers/
│   │   ├── crudFactory.js     ← CRUD genérico reaproveitado pelos demais
│   │   ├── authController.js
│   │   ├── usuarioController.js
│   │   ├── pesquisadorController.js
│   │   ├── linhaController.js
│   │   ├── titulacaoController.js
│   │   ├── cursoController.js
│   │   ├── projetoController.js
│   │   ├── producaoController.js
│   │   └── publicoController.js   ← somente leitura, para o site público
│   │
│   ├── routes/
│   │   ├── index.js           ← /api → auth, publico, admin
│   │   ├── authRoutes.js
│   │   ├── publicoRoutes.js
│   │   ├── adminRoutes.js
│   │   └── admin/             ← um arquivo de rotas por recurso
│   │
│   └── helpers/               ← middlewares, services, validações e utilitários
│       ├── auth.js            ← autenticar / autorizar / donoOuAdmin
│       ├── validate.js        ← validação com Zod
│       ├── rateLimit.js       ← proteção das rotas de login
│       ├── errorHandler.js    ← resposta de erro padronizada + 404
│       ├── authService.js     ← regras do login em duas etapas
│       ├── tokenService.js    ← emissão/verificação dos JWT
│       ├── totpService.js     ← Google Authenticator (segredo, QR Code, verificação)
│       ├── authSchemas.js  ├── entidadeSchemas.js   ← schemas Zod
│       ├── ApiError.js     ├── asyncHandler.js      └── paginacao.js
│       └── seed.js            ← cria as tabelas e popula os dados iniciais
│
└── frontend/
    ├── index.html
    ├── vite.config.js           ← alias @ → src, proxy /api, auto-import da BVN
    ├── package.json
    ├── .env.example
    ├── .gitignore
    ├── README.md
    └── src/
        ├── main.js              ← createApp, Pinia, Router, SCSS
        ├── App.vue              ← <BApp> (necessário para useToast/useModal)
        ├── router/index.js      ← rotas públicas + /admin com guarda de JWT
        ├── layouts/
        │   ├── PublicLayout.vue ← navbar + rodapé do site
        │   └── AdminLayout.vue  ← navbar + sidebar do painel
        ├── views/
        │   ├── publico/         ← Home, Sobre, Pesquisadores, Projetos, Cursos, Produções
        │   ├── admin/           ← Login, Dashboard e um CRUD por entidade
        │   └── NotFound.vue
        ├── components/
        │   ├── comum/           ← PageHeader, CarregandoBloco, EstadoVazio
        │   ├── publico/         ← TheNavbar, TheFooter, CursoCard
        │   └── admin/           ← AdminSidebar, CrudView (tabela + modal genéricos)
        ├── stores/auth.js       ← sessão, etapas do login, categorias
        ├── services/
        │   ├── http.js          ← axios + interceptors (token e refresh automático)
        │   ├── authService.js   ├── adminService.js  └── publicoService.js
        ├── utils/formatadores.js← traduz os códigos numéricos do banco
        └── styles/main.scss     ← variáveis do Bootstrap + utilitários do tema
```

---

## 3. Modelo de dados

Derivado de `backend/DER.png`.

**Todas as chaves primárias e estrangeiras são UUID v4**, declaradas como
`DataTypes.UUID` com `defaultValue: DataTypes.UUIDV4` — o Sequelize gera o valor na
aplicação e, no MariaDB, a coluna vira `CHAR(36) BINARY`. Nenhuma tabela usa
`AUTO_INCREMENT`.

| Tabela | Campos principais | Relacionamentos |
|---|---|---|
| `linhas` | `descricao` | 1:N com `pesquisador` |
| `pesquisador` | `nome`, `email` (único), `matricula`, `linhas_id` | núcleo do modelo |
| `usuarios` | `username` (único), `categoria`, `status`, `pesquisador_id` | N:1 com `pesquisador` |
| `titulacao` | `titulo`, `instituicao`, `ano` | N:1 com `pesquisador` |
| `cursos` | `titulo`, `resumo`, `inicio`, `inscricoes_inicio`, `inscricoes_fim` | N:1 com `pesquisador` (responsável) |
| `projetos` | `titulo`, `resumo`, `status`, `tipo` | N:1 com `pesquisador` (coordenador) |
| `orientacacoes` | — | N:N entre `pesquisador` e `projetos` |
| `producao` | `titulo`, `ano`, `veiculo` (+ campos abaixo) | — |
| `autores` | `ordem` | N:N entre `pesquisador` e `producao` |

### Integridade referencial

As chaves estrangeiras são declaradas **apenas** em `models/index.js`, junto das
associações — os models só informam o tipo da coluna. Isso evita constraints duplicadas
no `sync`. Comportamento ao apagar o registro-pai:

| Vínculo | Ao apagar o pai |
|---|---|
| `linhas` → `pesquisador` | `SET NULL` (o pesquisador fica sem linha) |
| `pesquisador` → `usuarios` | `SET NULL` (a conta perde o vínculo) |
| `pesquisador` → `titulacao` | `CASCADE` (a titulação não existe sozinha) |
| `pesquisador` → `cursos` / `projetos` | `RESTRICT` (bloqueia enquanto houver vínculo) |
| `orientacacoes` e `autores` | `CASCADE` nas duas pontas |

### Códigos numéricos

| Coluna | Valores |
|---|---|
| `usuarios.categoria` | 1 Administrador · 2 Coordenador · 3 Pesquisador |
| `usuarios.status` | 0 Inativo · 1 Ativo · 2 Bloqueado |
| `projetos.status` | 0 Em elaboração · 1 Em andamento · 2 Concluído · 3 Cancelado |
| `projetos.tipo` | 1 Pesquisa · 2 Extensão · 3 Desenvolvimento · 4 Ensino |
| `producao.tipo` | 1 Artigo periódico · 2 Artigo evento · 3 Capítulo · 4 Livro · 5 Dissertação · 6 Tese · 7 Software · 8 Patente · 99 Outro |

### Três divergências conscientes em relação ao DER

1. **`usuarios` ganhou três colunas** que o diagrama não previa, porque são exigidas pela
   autenticação pedida: `senha_hash` (bcrypt), `totp_secret` (segredo do Google
   Authenticator) e `totp_ativo`. Nenhuma delas é devolvida pela API — o `defaultScope` do
   model as exclui de toda consulta.
2. **`producao` exibia "7 more..."** no diagrama, com as colunas ocultas. Foram propostas
   `tipo`, `doi`, `issn_isbn`, `volume`, `paginas`, `qualis` e `url`. Se o diagrama completo
   trouxer outros nomes, ajuste `backend/models/Producao.js` e os formulários
   correspondentes no frontend.
3. **Os tipos das chaves mudaram**: o DER usa `VARCHAR(45)`, `VARCHAR(50)` e `VARCHAR(100)`
   para os IDs, e `INT AUTO_INCREMENT` em `projetos.id`. Todos passaram a ser UUID
   (`CHAR(36)`), inclusive `projetos.id` e `orientacacoes.projetos_id`. Uma consequência
   prática: UUID não tem ordem cronológica, então as listagens de projetos ordenam por
   título, não por ID.

---

## 4. Autenticação (JWT + Google Authenticator)

O login tem duas etapas e três tipos de token.

```
1) POST /api/auth/login        { username, senha }
      ↓ senha confere
   devolve mfaToken (5 min)
   + no primeiro acesso: qrCode e segredo do Google Authenticator

2) POST /api/auth/verificar    { mfaToken, codigo }
      ↓ código TOTP de 6 dígitos confere
   devolve accessToken (2h), refreshToken (7d) e os dados do usuário

3) Requisições a /api/admin/*  Authorization: Bearer <accessToken>

4) POST /api/auth/refresh      { refreshToken }  → novo par de tokens
```

- O **primeiro acesso** de cada usuário gera o segredo TOTP e devolve o QR Code; o 2FA só
  é marcado como ativo depois que o usuário acerta o primeiro código.
- O frontend renova o `accessToken` automaticamente no interceptor do axios
  (`src/services/http.js`) quando recebe 401; se a renovação falha, encerra a sessão.
- `POST /api/auth/2fa/reiniciar` (ou, para um admin, `/admin/usuarios/:id/reiniciar-2fa`)
  desvincula o aparelho — útil quando o usuário troca de celular.
- As rotas de login e verificação têm limite de tentativas (`express-rate-limit`).

### Autorização

| Middleware | Efeito |
|---|---|
| `autenticar` | exige access token válido e usuário ativo |
| `autorizar(...categorias)` | restringe a rota a determinadas categorias |
| `donoOuAdmin(campo)` | pesquisador só manipula registros vinculados a ele; admin e coordenador passam |

---

## 5. Endpoints da API

Prefixo padrão: `/api`.

### `/auth`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | etapa 1 — usuário e senha |
| POST | `/auth/verificar` | etapa 2 — código do Google Authenticator |
| POST | `/auth/refresh` | renova o access token |
| GET | `/auth/eu` | dados do usuário autenticado |
| POST | `/auth/trocar-senha` | troca da própria senha |
| GET | `/auth/2fa/qrcode` | reexibe o QR Code |
| POST | `/auth/2fa/reiniciar` | desvincula o aparelho do 2FA |

### `/publico` (sem autenticação, somente leitura)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/publico/estatisticas` | números da home e produção por ano |
| GET | `/publico/linhas` | linhas com contagem de pesquisadores |
| GET | `/publico/pesquisadores` | lista paginada (`?q`, `?linha`) |
| GET | `/publico/pesquisadores/:id` | perfil com titulações, projetos e produções |
| GET | `/publico/projetos` | lista paginada (`?status`, `?tipo`) |
| GET | `/publico/projetos/:id` | projeto com coordenador e equipe |
| GET | `/publico/cursos` | lista paginada (`?abertos=1`) |
| GET | `/publico/cursos/:id` | curso com responsável |
| GET | `/publico/producoes` | lista paginada (`?q`, `?ano`, `?tipo`) |

### `/admin` (exige `Authorization: Bearer`)

CRUD completo (`GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`) em:

`/admin/pesquisadores` · `/admin/linhas` · `/admin/titulacoes` · `/admin/cursos` ·
`/admin/projetos` · `/admin/producoes` · `/admin/usuarios` *(só administradores)*

Rotas adicionais:

| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/pesquisadores/:id/completo` | currículo com todos os vínculos |
| POST | `/admin/projetos/:id/equipe` | vincula pesquisador ao projeto |
| DELETE | `/admin/projetos/:id/equipe/:pesquisadorId` | remove o vínculo |
| POST | `/admin/producoes/:id/autores` | vincula autor à produção |
| DELETE | `/admin/producoes/:id/autores/:pesquisadorId` | remove a autoria |
| POST | `/admin/usuarios/:id/reiniciar-2fa` | admin libera novo vínculo de aparelho |

### Formatos de resposta

Listagens:

```json
{
  "data": [ /* registros */ ],
  "meta": { "total": 42, "page": 1, "limit": 20, "totalPages": 3 }
}
```

Erros:

```json
{
  "erro": "Dados inválidos.",
  "detalhes": [{ "campo": "email", "mensagem": "E-mail inválido." }]
}
```

---

## 6. Rotas do frontend

| Caminho | Nome | Acesso |
|---|---|---|
| `/` | `home` | público |
| `/sobre` | `sobre` | público |
| `/pesquisadores` · `/pesquisadores/:id` | `pesquisadores` · `pesquisador` | público |
| `/projetos` · `/projetos/:id` | `projetos` · `projeto` | público |
| `/cursos` · `/cursos/:id` | `cursos` · `curso` | público |
| `/producoes` | `producoes` | público |
| `/admin/login` | `admin-login` | só visitantes |
| `/admin/dashboard` | `admin-dashboard` | autenticado |
| `/admin/pesquisadores` | `admin-pesquisadores` | autenticado |
| `/admin/linhas` | `admin-linhas` | autenticado |
| `/admin/projetos` | `admin-projetos` | autenticado |
| `/admin/cursos` | `admin-cursos` | autenticado |
| `/admin/producoes` | `admin-producoes` | autenticado |
| `/admin/usuarios` | `admin-usuarios` | só Administrador |
| `/admin/perfil` | `admin-perfil` | autenticado |

A guarda global (`router.beforeEach`) restaura a sessão antes de decidir, redireciona para
o login quando falta token e respeita o `meta.categorias` de cada rota.

O componente `components/admin/CrudView.vue` concentra a mecânica das telas de cadastro
(busca, tabela paginada, modal de formulário, confirmação de remoção, toasts). Cada tela
administrativa só declara os campos da tabela, o formulário e o serviço correspondente.

---

## 7. Variáveis de ambiente

### `backend/.env`

| Variável | Para que serve |
|---|---|
| `PORT`, `API_PREFIX`, `NODE_ENV` | servidor HTTP |
| `CORS_ORIGIN` | origens liberadas (lista separada por vírgula) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | conexão MariaDB |
| `DB_LOGGING`, `DB_SYNC`, `DB_SYNC_ALTER` | log de SQL e sincronização automática (dev) |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | access token |
| `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN` | refresh token |
| `JWT_MFA_SECRET`, `JWT_MFA_EXPIRES_IN` | token intermediário do 2FA |
| `TOTP_ISSUER`, `TOTP_WINDOW` | nome exibido no Google Authenticator e tolerância de relógio |
| `SEED_ADMIN_*` | usuário administrador criado por `npm run db` |

### `frontend/.env`

| Variável | Para que serve |
|---|---|
| `VITE_API_URL` | URL base da API usada pelo axios |
| `VITE_API_PROXY` | alvo do proxy do Vite em desenvolvimento |
| `VITE_APP_NOME`, `VITE_APP_DESCRICAO` | identidade do site público |

Os três segredos JWT devem ser diferentes entre si. Gere cada um com:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 8. Como colocar para rodar

### Banco

```sql
CREATE DATABASE i2a CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'i2a_user'@'localhost' IDENTIFIED BY 'sua_senha';
GRANT ALL PRIVILEGES ON i2a.* TO 'i2a_user'@'localhost';
FLUSH PRIVILEGES;
```

### Backend

```bash
cd backend
npm install
cp .env.example .env    # preencher credenciais e segredos
npm run db              # cria as tabelas e o administrador inicial
npm run dev             # http://localhost:3000/api
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev             # http://localhost:5173
```

### Primeiro login

1. Acesse `http://localhost:5173/admin/login`.
2. Entre com o usuário e a senha definidos em `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`.
3. Escaneie o QR Code exibido com o **Google Authenticator**.
4. Digite o código de 6 dígitos para concluir o vínculo e entrar no painel.
5. Troque a senha em **Meu perfil**.

---

## 9. Decisões de projeto

- **ES6 Modules no backend** (`"type": "module"`): todo `import`/`export`, sem `require`.
- **Estrutura plana**: `config/`, `models/`, `controllers/`, `routes/` e `helpers/` ficam
  na raiz de `backend/`, sem pasta `src/`. O `index.js` é o próprio servidor Express —
  ele registra middlewares e rotas e chama `listen()`; também exporta o `app`, caso um
  teste queira montá-lo sem abrir porta.
- **`helpers/` concentra o apoio**: middlewares, services de autenticação, schemas Zod,
  utilitários e os scripts de banco. É a pasta onde entra tudo que não é rota, controller
  ou model.
- **`crudFactory` e `CrudView`**: o CRUD é praticamente igual em nove entidades — centralizá-lo
  evita nove cópias do mesmo código nos dois lados.
- **Camada `services` no backend**: as regras da autenticação ficam fora dos controllers,
  que só traduzem HTTP.
- **`timestamps: false` no Sequelize**: o DER não prevê `created_at`/`updated_at`. Se quiser
  auditoria, ligue em `config/database.js` e rode `npm run db -- --alter`.
- **Validação com Zod antes do controller**: erros de formato nunca chegam ao banco, e a
  resposta de erro é sempre a mesma estrutura.
- **Senhas com bcrypt** e segredos TOTP nunca trafegam pela API depois do cadastro inicial.

## 10. Próximos passos sugeridos

- Migrations versionadas (`sequelize-cli` ou Umzug) no lugar do `sync` para produção.
- Upload de foto do pesquisador e de arquivos (PDF) das produções.
- Importação de currículo Lattes para popular titulações e produções.
- Inscrição on-line nos cursos (hoje o sistema só divulga a janela de inscrições).
- Testes automatizados: Vitest no frontend, Node test runner + Supertest no backend.
