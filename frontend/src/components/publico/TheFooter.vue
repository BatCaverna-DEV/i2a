<template>
  <footer class="bg-dark text-light mt-5 py-4">
    <BContainer>
      <BRow class="gy-3">
        <BCol md="6">
          <h6 class="fw-bold mb-2">Grupo de Pesquisa I2A</h6>
          <p class="small mb-0 text-white-50">
            Inteligência Artificial e Aplicações — IFMA, Campus Coelho Neto.
          </p>
        </BCol>

        <BCol md="3">
          <h6 class="fw-bold mb-2">Navegação</h6>
          <ul class="list-unstyled small mb-0">
            <li><RouterLink class="link-light text-decoration-none" :to="{ name: 'sobre' }">Sobre</RouterLink></li>
            <li><RouterLink class="link-light text-decoration-none" :to="{ name: 'projetos' }">Projetos</RouterLink></li>
            <li><RouterLink class="link-light text-decoration-none" :to="{ name: 'cursos' }">Cursos</RouterLink></li>
          </ul>
        </BCol>

        <BCol md="3">
          <h6 class="fw-bold mb-2">Contato</h6>
          <p class="small text-white-50 mb-0">
            <i class="bi bi-envelope me-1" />i2a@ifma.edu.br
          </p>
        </BCol>
      </BRow>

      <hr class="border-secondary my-3" />
      <p class="small text-white-50 mb-0 text-center">
        © {{ ano }} Grupo de Pesquisa I2A · IFMA
      </p>
    </BContainer>
  </footer>
</template>

<script setup>
import { BContainer, BRow, BCol } from 'bootstrap-vue-next';

const ano = new Date().getFullYear();
</script>
