<template>
  <header class="i2a-navbar sticky-top">
    <BContainer>
      <nav class="navbar navbar-expand-lg p-0">
        <RouterLink :to="{ name: 'home' }" class="navbar-brand d-flex align-items-center gap-2">
          <span class="i2a-logo">{{ APP.sigla }}</span>
          <span class="i2a-navbar-sub d-none d-sm-inline">Inteligência Artificial e Aplicações</span>
        </RouterLink>

        <button
          class="navbar-toggler border-0 px-1"
          type="button"
          aria-label="Abrir menu"
          @click="aberto = !aberto"
        >
          <i class="bi fs-4" :class="aberto ? 'bi-x-lg' : 'bi-list'" />
        </button>

        <div class="collapse navbar-collapse" :class="{ show: aberto }">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <li v-for="item in menu" :key="item.rota" class="nav-item">
              <RouterLink :to="{ name: item.rota }" class="nav-link px-lg-3" @click="aberto = false">
                {{ item.rotulo }}
              </RouterLink>
            </li>
            <li class="nav-item ms-lg-3 my-2 my-lg-0">
              <RouterLink
                :to="{ name: 'admin-login' }"
                class="btn btn-ciano btn-sm px-3"
                @click="aberto = false"
              >
                <i class="bi bi-box-arrow-in-right me-1" />Entrar
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>
    </BContainer>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { BContainer } from 'bootstrap-vue-next';

import { APP } from '@/config';

const aberto = ref(false);

const menu = [
  { rota: 'sobre', rotulo: 'Sobre' },
  { rota: 'pesquisadores', rotulo: 'Equipe' },
  { rota: 'projetos', rotulo: 'Projetos' },
  { rota: 'producoes', rotulo: 'Publicações' },
  { rota: 'cursos', rotulo: 'Cursos' },
  { rota: 'participe', rotulo: 'Participe' },
  { rota: 'contato', rotulo: 'Contato' }
];
</script>
