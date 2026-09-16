<template>
  <nav class="i2a-sidebar p-3">
    <p class="i2a-eyebrow mb-2 px-2">Conteúdo</p>
    <ul class="nav flex-column gap-1 mb-4">
      <li v-for="item in conteudo" :key="item.rota" class="nav-item">
        <RouterLink :to="{ name: item.rota }" class="nav-link py-2 px-2 d-flex gap-2 align-items-center">
          <i :class="`bi ${item.icone}`" />
          <span>{{ item.rotulo }}</span>
        </RouterLink>
      </li>
    </ul>

    <template v-if="sistemaVisivel.length">
      <p class="i2a-eyebrow mb-2 px-2">Sistema</p>
      <ul class="nav flex-column gap-1">
        <li v-for="item in sistemaVisivel" :key="item.rota" class="nav-item">
          <RouterLink :to="{ name: item.rota }" class="nav-link py-2 px-2 d-flex gap-2 align-items-center">
            <i :class="`bi ${item.icone}`" />
            <span>{{ item.rotulo }}</span>
          </RouterLink>
        </li>
      </ul>
    </template>
  </nav>
</template>

<script setup>
import { computed } from 'vue';

import { useAuthStore, CATEGORIA } from '@/stores/auth';

const auth = useAuthStore();

const conteudo = [
  { rota: 'admin-dashboard', rotulo: 'Painel', icone: 'bi-speedometer2' },
  { rota: 'admin-pesquisadores', rotulo: 'Pesquisadores', icone: 'bi-people' },
  { rota: 'admin-linhas', rotulo: 'Linhas de pesquisa', icone: 'bi-diagram-3' },
  { rota: 'admin-projetos', rotulo: 'Projetos', icone: 'bi-kanban' },
  { rota: 'admin-cursos', rotulo: 'Cursos', icone: 'bi-mortarboard' },
  { rota: 'admin-producoes', rotulo: 'Publicações', icone: 'bi-journal-text' }
];

const sistema = [
  {
    rota: 'admin-usuarios',
    rotulo: 'Usuários',
    icone: 'bi-shield-lock',
    categorias: [CATEGORIA.ADMIN]
  },
  { rota: 'admin-perfil', rotulo: 'Meu perfil', icone: 'bi-person-gear' }
];

const sistemaVisivel = computed(() =>
  sistema.filter((item) => !item.categorias || item.categorias.includes(auth.usuario?.categoria))
);
</script>
