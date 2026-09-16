# Frontend — Grupo de Pesquisa I2A

Aplicação Vue 3 (Composition API + `<script setup>`) com Vite, Vue Router, Pinia e
bootstrap-vue-next (Bootstrap 5). Um único projeto atende as duas partes do sistema:

- **`/`** — site público, consome as rotas `/api/publico/*` sem autenticação;
- **`/admin`** — painel administrativo, protegido por JWT na guarda do router.

## Como rodar

```bash
cd frontend
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

O Vite faz proxy de `/api` para `http://localhost:3000`, então não há CORS em
desenvolvimento. Suba o backend antes.

## Build de produção

```bash
npm run build        # gera dist/
npm run preview      # confere o build localmente
```

Como o router usa `createWebHistory`, o servidor de produção precisa redirecionar
todas as rotas para `index.html` (fallback de SPA).

A descrição completa da arquitetura está em `../sistema.md`.
