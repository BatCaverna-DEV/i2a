# i2a.md — mapa rápido do sistema

Resumo para retomar o contexto sem reler o código. Documentação longa: `sistema.md`
(arquitetura) e `roadmap-site.md` (o que falta). Estado de 2026-09-22, branch `feat/site-i2a`.

## O que é

Site do **Grupo de Pesquisa I2A — Inteligência Artificial e Aplicações** (IFMA, Campus Coelho Neto).
Uma base, duas faces:

- `/` — site público, sem login, somente leitura.
- `/admin` — painel onde os membros cadastram pesquisadores, linhas, projetos, cursos,
  titulações, produções e contas de acesso.

Monorepo: `backend/` (API) e `frontend/` (SPA). Sem testes automatizados.

## Stack

| Lado | Tecnologia |
|---|---|
| Backend | Node ≥18, ES Modules (`"type": "module"`), Express 4, Sequelize 6, MariaDB, Zod, jsonwebtoken, google-auth-library |
| Frontend | Vue 3 `<script setup>`, Vite 5, Vue Router 4, Pinia, bootstrap-vue-next (Bootstrap 5.3), axios, SCSS |
| Login | somente conta Google (Google Identity Services); **não existe senha** |

Idioma do código, comentários, mensagens e commits: **português**.

## Como rodar

```bash
# backend (http://localhost:3000/api)
cd backend && npm install && cp .env.example .env
npm run db        # sync das tabelas + seed do admin (SEED_ADMIN_EMAIL)
npm run dev       # node --watch index.js

# frontend (http://localhost:5173)
cd frontend && npm install && npm run dev
```

Scripts extras do backend: `npm run db:google`, `npm run db:papeis`, `npm run db:tipo` e
`npm run db:ano-projeto` (migrações pontuais: login Google, papéis, `pesquisador.tipo` e
`projetos.ano`). Coluna nova no model exige rodar a migração ANTES de reiniciar a API. Não há migrations versionadas: o
schema vem do `sequelize.sync` (`DB_SYNC`, `DB_SYNC_ALTER`).

`VITE_USE_MOCKS=true` faz o frontend rodar sem backend (dados em `src/mocks/`, login
entra direto como admin de exemplo).

## Backend — `backend/`

Estrutura plana, sem `src/`:

```
index.js        Express: helmet, cors, compression, morgan, /health, /api, errorHandler
config/         env.js (lê o .env uma vez) · database.js (instância Sequelize)
models/         um arquivo por tabela; index.js declara TODAS as associações e FKs
controllers/    crudFactory.js + um controller por recurso + publicoController.js
routes/         index.js → /auth, /publico, /admin (admin/ tem um arquivo por recurso)
helpers/        middlewares, services, schemas Zod, utilitários, seed e migrações
```

### Modelo de dados

Todas as PKs/FKs são **UUID v4** (`CHAR(36)`), geradas pela aplicação. `timestamps: false`.
Como UUID não ordena por tempo, as listagens ordenam por título/nome/ano.

```
linhas 1─N pesquisador                       (SET NULL)
pesquisador 1─N usuarios                     (SET NULL; na prática 1 conta por pesquisador)
pesquisador 1─N titulacao                    (CASCADE)
pesquisador 1─N cursos      as 'responsavel' (RESTRICT)
pesquisador 1─N projetos    as 'coordenador' (RESTRICT)
pesquisador N─N projetos    via orientacacoes  (as 'projetos' / 'equipe')
pesquisador N─N producao    via autores        (as 'producoes' / 'autores', coluna ordem)
```

Nomes de tabela herdados do DER (`backend/DER.png`), inclusive o erro de grafia
**`orientacacoes`** — não "corrigir" sem migrar o banco.

Códigos numéricos (constantes exportadas por `models/index.js`; espelho no front em
`utils/formatadores.js` e `stores/auth.js`):

- `pesquisador.tipo`: 1 Pesquisador · 2 Aluno (orientando). É o *que a pessoa é*; a
  `categoria` é *o que a conta pode fazer*. No cadastro, sem `tipo` explícito, segue a
  categoria (Orientando → Aluno); admin mudar a categoria recalcula o tipo.
- `usuarios.categoria`: 1 Administrador · 2 Pesquisador · 3 Orientando
- `usuarios.status`: 0 Inativo · 1 Ativo · 2 Bloqueado
- `projetos.status`: 0 Em elaboração · 1 Em andamento · 2 Concluído · 3 Cancelado
- `projetos.tipo`: 1 Pesquisa · 2 Extensão · 3 Desenvolvimento · 4 Ensino
- `producao.tipo`: 1 Art. periódico · 2 Art. evento · 3 Capítulo · 4 Livro · 5 Dissertação · 6 Tese · 7 Software · 8 Patente · 99 Outro

`usuarios.google_sub` nunca sai da API (excluído pelo `defaultScope`/`toJSON`; usar
`Usuario.scope('completo')` quando precisar dele).

### Padrão de CRUD — `controllers/crudFactory.js`

```js
crudFactory({ model, nome, includes, camposBusca, filtrosPermitidos,
              ordenacaoPadrao, escopo, campoDono })
// → { listar, buscar, criar, atualizar, remover, montarWhere }
```

- `?q=` faz LIKE nos `camposBusca`; `filtrosPermitidos` viram `where` direto da query.
- `escopo(req)` → `where` extra por papel, aplicado por último (a query não o sobrescreve).
- `campoDono` → `atualizar`/`remover` chamam `exigirPosse` antes de alterar.
- Controllers concretos reaproveitam o que serve e sobrescrevem o resto
  (ex.: `pesquisadorController` reescreve criar/atualizar/remover; `producaoController`
  reescreve criar/atualizar/remover porque a posse vem da tabela `autores`).

Paginação (`helpers/paginacao.js`): resposta `{ data, meta: { total, page, limit, totalPages } }`.
Erros (`helpers/ApiError.js` + `errorHandler.js`): `{ erro, detalhes?: [{ campo, mensagem }] }`.
Validação: `validate(schemaZod)` como middleware, schemas em `helpers/entidadeSchemas.js`
e `helpers/authSchemas.js`. Handlers async sempre envolvidos em `asyncHandler`.

### Autenticação — fluxo

1. Front recebe um ID token do botão Google → `POST /api/auth/google { credential }`
   (com rate limit).
2. `googleService.verificarIdToken` confere assinatura/emissor/`aud`.
3. `authService.entrarComGoogle`: e-mail precisa existir em `usuarios` (senão 403);
   status precisa ser Ativo; se `google_sub` já gravado e diferente → 403; grava sub,
   nome, avatar, `ultimo_acesso`.
4. Devolve `accessToken` (2h) + `refreshToken` (7d), segredos distintos
   (`tokenService.js`). Payload tem `sub` (id do usuário) e `tipo` (`access`/`refresh`).
5. `/api/admin/*` passa por `autenticar` (em `routes/adminRoutes.js`), que recarrega o
   usuário do banco a cada requisição e põe em `req.usuario`.

Autorizar alguém = cadastrar o e-mail (Painel → Usuários, ou cadastrar o pesquisador).
"Desvincular" zera `google_sub` para permitir outra conta Google com o mesmo e-mail.

### Papéis e permissões

Middlewares em `helpers/auth.js`: `autenticar`, `autorizar(...cats)`, `somenteAdmin`,
`bloquearOrientando` (barra POST/PUT/PATCH/DELETE), `donoOuAdmin(campo)` (em POST força
`req.body[campo] = usuario.pesquisador_id`), e a função `exigirPosse(usuario, registro, campo)`.

| Recurso | Admin | Pesquisador | Orientando |
|---|---|---|---|
| Projetos | tudo | lista os que coordena; escreve nos seus; monta equipe dos seus | lê os que participa |
| Produções | tudo | lista/escreve as de que é autor (criar já o torna autor) | lê as de que é autor |
| Cursos, titulações | tudo | os próprios | os próprios (só leitura) |
| Pesquisadores | tudo | lê todos; edita só o próprio; cria **só orientandos** | lê |
| Linhas | CRUD | leitura | leitura |
| Usuários | CRUD (`somenteAdmin`) | — | — |

Criar pesquisador = criar pesquisador + usuário na **mesma transação** (username derivado
do e-mail). Trocar o e-mail do pesquisador zera o `google_sub` da conta. Só admin muda
a categoria. Apagar pesquisador apaga a conta junto (e falha se ele coordena projetos ou
responde por cursos, por causa do RESTRICT).

### Endpoints

- `/auth`: `POST google`, `POST refresh`, `GET eu`, `POST desvincular`
- `/publico` (sem auth): `estatisticas`, `linhas`, `pesquisadores[/:id]`, `projetos[/:id]`
  (lista oculta status 0), `cursos[/:id]` (`?abertos=1`), `producoes` (`?q ?ano ?tipo`)
- `/admin`: CRUD em `pesquisadores`, `linhas`, `titulacoes`, `cursos`, `projetos`,
  `producoes`, `usuarios` + `pesquisadores/:id/completo`, `projetos/:id/equipe[/:pid]`,
  `producoes/:id/autores[/:pid]`, `usuarios/:id/desvincular`
- `GET /admin/pesquisadores?categoria=N` filtra pelo tipo da conta (listar orientandos).
- `POST/PUT /admin/projetos` aceitam `orientandos: [uuid]`: `sincronizarOrientandos`
  (projetoController) deixa os orientandos em `orientacacoes` iguais à lista, na mesma
  transação; membros não orientandos são preservados; id que não é Orientando → 400.

### Orientandos no cadastro de projeto

`ProjetosAdmin.vue` mostra os orientandos como checkboxes (`form.orientandos`) e tem um
cadastro rápido embutido ("Cadastrar orientando": nome, e-mail, matrícula) que chama
`pesquisadores.criar({ ..., categoria: 3 })` e já marca o novo orientando. A lista vem de
`pesquisadores.listar({ categoria: 3, limit: 100 })` (o máximo da paginação é 100).
Os mocks espelham os dois comportamentos (`aplicarOrientandos` em `mocks/index.js`).

## Frontend — `frontend/src/`

```
main.js / App.vue     createApp + Pinia + Router; <BApp> envolve tudo (toasts/modais)
config.js             USANDO_MOCKS, GOOGLE_CLIENT_ID, APP (nome, sigla, e-mail, campus)
router/index.js       ramo público (PublicLayout) e /admin (AdminLayout, meta.requerAuth)
stores/auth.js        sessão: usuario, accessToken, ehAdmin/ehPesquisador/ehOrientando,
                      podeEscrever, entrarComGoogle, restaurarSessao, sair; CATEGORIA
services/http.js      axios; injeta Bearer; em 401 tenta refresh uma vez (promessa
                      compartilhada) e senão manda para /admin/login
services/*Service.js  cada função tem versão real e de mock; escolha única por USANDO_MOCKS
mocks/                dados.js (exemplos), repositorio.js (CRUD em memória), index.js
                      (mesma assinatura dos services reais)
components/admin/CrudView.vue   busca + tabela paginada + modal de formulário + remoção
views/admin/*Admin.vue          só declaram colunas, formulário e service → CrudView
views/publico/*       Home, Sobre, Pesquisadores(+perfil), Projetos(+detalhe),
                      Cursos(+detalhe), Producoes, Participe, Contato
utils/formatadores.js traduz os códigos numéricos em rótulos
styles/main.scss      variáveis do Bootstrap (tema azul) + utilitários
```

Tokens em `localStorage` (`i2a.accessToken`, `i2a.refreshToken`). O guard global
restaura a sessão antes de decidir e respeita `meta.categorias` (só `admin-usuarios`
exige Administrador). O front esconde botões por papel, mas **quem decide é a API**.

Alias `@` → `src`. Vite faz proxy de `/api` para `VITE_API_PROXY`. Componentes `<B…>`
são auto-importados (`unplugin-vue-components`).

## Pendências e armadilhas conhecidas

- **`buscar` do crudFactory ignora o `escopo`**: `GET /admin/<recurso>/:id` devolve
  qualquer registro a qualquer papel (ex.: orientando lê qualquer projeto).
- **Projetos "Em elaboração" vazam no público**: `/publico/projetos/:id` e o perfil
  `/publico/pesquisadores/:id` não filtram status 0.
- `frontend/.env` está versionado (só tem o Client ID, que é público), apesar de a
  documentação dizer o contrário.
- `http.js` ainda exclui `/auth/login` e `/auth/verificar` do refresh, rotas do antigo
  login com senha que não existem mais.
- O front chama `GET /publico/oportunidades` (Participe), **que não existe no backend**;
  só funciona com mocks.
- O formulário de Contato valida mas não envia (não há `POST /publico/contato`).
- E-mails dos pesquisadores aparecem no público (preocupação de LGPD no roadmap).
- Pesquisador cria orientandos mas não pode editá-los depois (a posse é conferida contra
  o próprio id).

## Próximos passos (roadmap-site.md)

1. Rodar com `VITE_USE_MOCKS=false` e conferir tela por tela.
2. Notícias (tabela `noticias` + listagem + bloco na home).
3. Oportunidades como tabela + contato funcionando (honeypot + rate limit).
4. Página por linha de pesquisa (`resumo`, `slug`, `GET /publico/linhas/:slug`).
5. BibTeX e importação do Lattes.
6. Inscrição on-line em cursos.
7. Inglês (vue-i18n) e SEO/Open Graph.

## Convenções ao mexer no código

- Novo recurso no backend: model → associação em `models/index.js` → schema Zod →
  controller via `crudFactory` (com `escopo`/`campoDono` se tiver dono) → arquivo em
  `routes/admin/` → registrar em `routes/adminRoutes.js`.
- Novo recurso no front: função real + mock com a mesma assinatura no service →
  `views/admin/XAdmin.vue` usando `CrudView` → rota em `router/index.js` → item no
  `AdminSidebar.vue`.
- Mudou schema? Atualize `sistema.md` (seção 3) e, se preciso, um script em `helpers/`
  para migrar bancos existentes (padrão de `migrar-google.js` / `migrar-papeis.js`).
