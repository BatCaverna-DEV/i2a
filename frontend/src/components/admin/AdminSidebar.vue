<template>
  <nav class="i2a-sidebar p-3">
    <ul class="nav nav-pills flex-column gap-1">
      <li v-for="item in itensVisiveis" :key="item.rota" class="nav-item">
        <RouterLink :to="{ name: item.rota }" class="nav-link d-flex align-items-center gap-2">
          <i :class="`bi ${item.icone}`" />
          <span>{{ item.rotulo }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue';

import { useAuthStore, CATEGORIA } from '@/stores/auth';

const auth = useAuthStore();

const itens = [
  { rota: 'admin-dashboard', rotulo: 'Painel', icone: 'bi-speedometer2' },
  { rota: 'admin-pesquisadores', rotulo: 'Pesquisadores', icone: 'bi-people' },
  { rota: 'admin-linhas', rotulo: 'Linhas de pesquisa', icone: 'bi-diagram-3' },
  { rota: 'admin-projetos', rotulo: 'Projetos', icone: 'bi-kanban' },
  { rota: 'admin-cursos', rotulo: 'Cursos', icone: 'bi-mortarboard' },
  { rota: 'admin-producoes', rotulo: 'Produção científica', icone: 'bi-journal-text' },
  { rota: 'admin-usuarios', rotulo: 'Usuários', icone: 'bi-shield-lock', categorias: [CATEGORIA.ADMIN] }
];

const itensVisiveis = computed(() =>
  itens.filter((item) => !item.categorias || item.categorias.includes(auth.usuario?.categoria))
);
</script>
