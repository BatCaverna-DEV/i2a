<template>
  <footer class="border-top mt-auto">
    <BContainer class="py-5">
      <BRow class="gy-4">
        <BCol lg="5">
          <p class="fw-bold mb-1">{{ APP.nome }}</p>
          <p class="i2a-meta mb-3">{{ APP.descricao }}</p>
          <p class="i2a-meta mb-0">
            {{ APP.instituicao }} · {{ APP.campus }}
          </p>
        </BCol>

        <BCol sm="6" lg="3">
          <p class="i2a-eyebrow mb-2">Navegação</p>
          <ul class="list-unstyled small mb-0 d-grid gap-1">
            <li v-for="item in navegacao" :key="item.rota">
              <RouterLink :to="{ name: item.rota }" class="link-dark text-decoration-none">
                {{ item.rotulo }}
              </RouterLink>
            </li>
          </ul>
        </BCol>

        <BCol sm="6" lg="4">
          <p class="i2a-eyebrow mb-2">Contato</p>
          <ul class="list-unstyled small mb-0 d-grid gap-1">
            <li>
              <a :href="`mailto:${APP.email}`" class="link-dark text-decoration-none">
                {{ APP.email }}
              </a>
            </li>
            <li class="i2a-meta">Campus Coelho Neto — Maranhão</li>
            <li>
              <RouterLink :to="{ name: 'participe' }" class="link-dark text-decoration-none">
                Oportunidades abertas
              </RouterLink>
            </li>
          </ul>
        </BCol>
      </BRow>

      <hr class="i2a-rule my-4" />

      <div class="d-flex flex-wrap justify-content-between gap-2 i2a-meta">
        <span>© {{ ano }} {{ APP.nome }}</span>
        <RouterLink :to="{ name: 'admin-login' }" class="link-secondary text-decoration-none">
          Área restrita
        </RouterLink>
      </div>
    </BContainer>
  </footer>
</template>

<script setup>
import { BContainer, BRow, BCol } from 'bootstrap-vue-next';

import { APP } from '@/config';

const ano = new Date().getFullYear();

const navegacao = [
  { rota: 'sobre', rotulo: 'Sobre o grupo' },
  { rota: 'pesquisadores', rotulo: 'Equipe' },
  { rota: 'projetos', rotulo: 'Projetos' },
  { rota: 'producoes', rotulo: 'Publicações' },
  { rota: 'cursos', rotulo: 'Cursos' }
];
</script>
