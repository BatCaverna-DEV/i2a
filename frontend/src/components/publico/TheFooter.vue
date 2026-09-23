<template>
  <footer class="i2a-rodape mt-auto">
    <BContainer class="py-5">
      <BRow class="gy-4">
        <BCol lg="5">
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="i2a-logo">{{ APP.sigla }}</span>
            <span class="fw-semibold text-white">{{ APP.nome }}</span>
          </div>
          <p class="mb-3" style="max-width: 42ch">{{ APP.descricao }}</p>
          <p class="i2a-meta mb-0">
            <i class="bi bi-geo-alt me-1" />{{ APP.instituicao }} · {{ APP.campus }}
          </p>
        </BCol>

        <BCol sm="6" lg="3">
          <p class="i2a-eyebrow mb-3">Navegação</p>
          <ul class="list-unstyled small mb-0 d-grid gap-2">
            <li v-for="item in navegacao" :key="item.rota">
              <RouterLink :to="{ name: item.rota }">{{ item.rotulo }}</RouterLink>
            </li>
          </ul>
        </BCol>

        <BCol sm="6" lg="4">
          <p class="i2a-eyebrow mb-3">Contato</p>
          <ul class="list-unstyled small mb-0 d-grid gap-2">
            <li>
              <a :href="`mailto:${APP.email}`"><i class="bi bi-envelope me-2" />{{ APP.email }}</a>
            </li>
            <li><i class="bi bi-pin-map me-2" />Campus Coelho Neto — Maranhão</li>
            <li>
              <RouterLink :to="{ name: 'participe' }">
                <i class="bi bi-stars me-2" />Oportunidades abertas
              </RouterLink>
            </li>
          </ul>
        </BCol>
      </BRow>

      <hr class="i2a-rule my-4" />

      <div class="d-flex flex-wrap justify-content-between gap-2 i2a-meta">
        <span>© {{ ano }} {{ APP.nome }}</span>
        <RouterLink :to="{ name: 'admin-login' }">
          <i class="bi bi-lock me-1" />Área restrita
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
