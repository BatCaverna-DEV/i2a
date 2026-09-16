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
- **Autenticação:** login com conta Google (Google Identity Services); a API valida o ID token e emite os próprios JWT. Sem senha.
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
│       ├── googleService.js   ← valida o ID token do Google
│       ├── authService.js     ← whitelist, vínculo da conta e emissão dos tokens
│       ├── tokenService.js    ← emissão/verificação dos JWT da aplicação
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
        │   ├── publico/         ← Home, Sobre, Equipe, Projetos, Publicações, Cursos, Participe, Contato
        │   ├── admin/           ← Login, Dashboard e um CRUD por entidade
        │   └── NotFound.vue
        ├── mocks/               ← dados de exemplo (VITE_USE_MOCKS)
        ├── components/
        │   ├── comum/           ← SecaoTitulo, CarregandoBloco, EstadoVazio, BarraDemo
        │   ├── publico/         ← TheNavbar, TheFooter, CursoCard
        │   └── admin/           ← AdminSidebar, CrudView, BotaoGoogle
        ├── stores/auth.js       ← sessão e categorias
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
| `usuarios` | `email` (único, autoriza o login), `username`, `google_sub`, `categoria`, `status` | N:1 com `pesquisador` |
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

1. **`usuarios` ganhou colunas** que o diagrama não previa, exigidas pelo login com conta
   Google: `email` (o endereço que autoriza o acesso), `google_sub` (identificador da conta
   Google, gravado no primeiro login), `nome`, `avatar_url` e `ultimo_acesso`. O
   `google_sub` nunca sai da API — o `defaultScope` e o `toJSON` do model o excluem de
   qualquer resposta. **Não existe coluna de senha em lugar nenhum.**
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

## 4. Autenticação (conta Google)

**O sistema não armazena senha.** Quem confirma a identidade é o Google; a
aplicação apenas decide se aquela conta pode entrar.

```
1) O navegador mostra o botão do Google (Google Identity Services)
      ↓ o usuário escolhe a conta
   o Google devolve um ID token na própria página

2) POST /api/auth/google  { credential }
      ↓ a API valida assinatura, emissor, expiração e `aud`
      ↓ procura o e-mail em `usuarios`  →  não achou? 403
      ↓ grava o `google_sub` no primeiro acesso
   devolve accessToken (2h), refreshToken (7d) e os dados do usuário

3) Requisições a /api/admin/*  →  Authorization: Bearer <accessToken>

4) POST /api/auth/refresh  { refreshToken }  → novo par de tokens
```

### Quem pode entrar

O acesso é **por lista**: só entra quem tem um registro em `usuarios` com aquele
e-mail. Uma conta Google válida e não cadastrada recebe 403 com uma mensagem
explicando o que fazer. Para autorizar alguém, um administrador cadastra o
e-mail em **Painel → Usuários**.

### Vínculo com a conta Google

No primeiro login o `google_sub` (identificador estável da conta Google) é
gravado no usuário. A partir daí, se o mesmo e-mail chegar com outro `sub`, o
acesso é bloqueado — isso protege contra troca de titular do endereço. Um
administrador pode soltar o vínculo em **Usuários → Desvincular**, e o próprio
usuário em **Meu perfil**.

### Por que validar o token no servidor

Um ID token é um JWT comum: qualquer pessoa consegue escrever um com o conteúdo
que quiser. O que o torna confiável é a assinatura do Google, conferida em
`helpers/googleService.js` contra as chaves públicas do Google. Aceitar o
conteúdo do token sem essa verificação deixaria qualquer um entrar como
administrador.

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
| POST | `/auth/google` | login com o ID token do Google |
| POST | `/auth/refresh` | renova o access token |
| GET | `/auth/eu` | dados do usuário autenticado |
| POST | `/auth/desvincular` | solta o vínculo com a conta Google atual |

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
| POST | `/admin/usuarios/:id/desvincular` | admin solta o vínculo Google do usuário |

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
| `GOOGLE_CLIENT_ID` | Client ID do OAuth 2.0; precisa bater com o do frontend |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | access token da aplicação |
| `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN` | refresh token |
| `SEED_ADMIN_USERNAME`, `SEED_ADMIN_NOME` | usuário administrador criado por `npm run db` |
| `SEED_ADMIN_EMAIL` | **e-mail da conta Google** autorizada no primeiro acesso |

### `frontend/.env`

| Variável | Para que serve |
|---|---|
| `VITE_USE_MOCKS` | `true` usa os dados de exemplo; `false` liga na API |
| `VITE_GOOGLE_CLIENT_ID` | mesmo Client ID do backend |
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

1. Crie o ID do cliente OAuth no Google Cloud Console e preencha
   `GOOGLE_CLIENT_ID` (backend) e `VITE_GOOGLE_CLIENT_ID` (frontend) com o mesmo valor.
   Cadastre `http://localhost:5173` nas *Origens JavaScript autorizadas*.
2. Ponha em `SEED_ADMIN_EMAIL` o e-mail da conta Google que será o administrador.
3. Rode `npm run db` no backend.
4. Acesse `http://localhost:5173/admin/login` e clique em **Entrar com o Google**.
5. Autorize os demais membros em **Painel → Usuários**, cadastrando o e-mail da
   conta Google de cada um.

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
- **Nenhuma senha é armazenada**: a identidade vem do Google e o sistema só decide
  quem entra. Isso elimina de uma vez hash de senha, recuperação por e-mail, política de
  complexidade e vazamento de credenciais.
- **Acesso por lista, não por domínio**: cadastrar o e-mail é um ato explícito de
  autorização. Um filtro por domínio deixaria entrar qualquer pessoa com e-mail
  institucional, incluindo quem não é do grupo.

## 10. Próximos passos sugeridos

- Migrations versionadas (`sequelize-cli` ou Umzug) no lugar do `sync` para produção.
- Upload de foto do pesquisador e de arquivos (PDF) das produções.
- Importação de currículo Lattes para popular titulações e produções.
- Inscrição on-line nos cursos (hoje o sistema só divulga a janela de inscrições).
- Testes automatizados: Vitest no frontend, Node test runner + Supertest no backend.
