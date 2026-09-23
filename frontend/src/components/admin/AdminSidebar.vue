<template>
  <nav class="i2a-sidebar p-3">
    <p class="i2a-eyebrow mb-2 px-2">Conteúdo</p>
    <ul class="nav flex-column gap-1 mb-4">
      <li v-for="item in conteudoVisivel" :key="item.rota" class="nav-item">
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

// Orientando só vê o painel e os projetos em que participa: o resto some
// do menu, porque a API recusaria essas telas de qualquer forma.
const TODOS = [CATEGORIA.ADMINISTRADOR, CATEGORIA.PESQUISADOR, CATEGORIA.ORIENTANDO];
const GESTORES = [CATEGORIA.ADMINISTRADOR, CATEGORIA.PESQUISADOR];

const conteudo = [
  { rota: 'admin-dashboard', rotulo: 'Painel', icone: 'bi-speedometer2', categorias: TODOS },
  { rota: 'admin-projetos', rotulo: 'Projetos', icone: 'bi-kanban', categorias: TODOS },
  { rota: 'admin-pesquisadores', rotulo: 'Pesquisadores', icone: 'bi-people', categorias: GESTORES },
  { rota: 'admin-producoes', rotulo: 'Publicações', icone: 'bi-journal-text', categorias: GESTORES },
  { rota: 'admin-cursos', rotulo: 'Cursos', icone: 'bi-mortarboard', categorias: GESTORES },
  { rota: 'admin-vagas', rotulo: 'Vagas', icone: 'bi-person-plus', categorias: GESTORES },
  {
    rota: 'admin-linhas',
    rotulo: 'Linhas de pesquisa',
    icone: 'bi-diagram-3',
    categorias: [CATEGORIA.ADMINISTRADOR]
  }
];

const sistema = [
  {
    rota: 'admin-usuarios',
    rotulo: 'Usuários',
    icone: 'bi-shield-lock',
    categorias: [CATEGORIA.ADMINISTRADOR]
  },
  { rota: 'admin-perfil', rotulo: 'Meu perfil', icone: 'bi-person-gear', categorias: TODOS }
];

const visivel = (itens) =>
  itens.filter((item) => !item.categorias || item.categorias.includes(auth.usuario?.categoria));

const conteudoVisivel = computed(() => visivel(conteudo));
const sistemaVisivel = computed(() => visivel(sistema));
</script>
