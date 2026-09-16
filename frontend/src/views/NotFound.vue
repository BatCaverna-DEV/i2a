<template>
  <BContainer class="py-5 text-center">
    <p class="display-1 fw-bold text-primary mb-0">404</p>
    <h1 class="h4 fw-semibold mb-3">Página não encontrada</h1>
    <p class="text-body-secondary mb-4">O endereço acessado não existe ou foi movido.</p>
    <BButton :to="{ name: 'home' }" variant="primary">Voltar ao início</BButton>
  </BContainer>
</template>

<script setup>
import { BContainer, BButton } from 'bootstrap-vue-next';
</script>
