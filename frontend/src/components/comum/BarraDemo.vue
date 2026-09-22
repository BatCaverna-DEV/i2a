<template>
  <!--
    Faixa de aviso exibida enquanto o site roda com dados de exemplo.
    Desaparece sozinha quando VITE_USE_MOCKS=false, sem precisar remover o
    componente de lugar nenhum.
  -->
  <div v-if="USANDO_MOCKS" class="i2a-demo-bar py-2 text-center">
    <BContainer class="d-flex flex-wrap justify-content-center gap-2 align-items-center">
      <i class="bi bi-info-circle" />
      <span>
        Modo demonstração — conteúdo fictício, ainda sem ligação com a API.
      </span>
      <code class="small">VITE_USE_MOCKS=false</code>
      <span class="d-none d-md-inline">liga os dados reais.</span>
    </BContainer>
  </div>
</template>

<script setup>
import { BContainer } from 'bootstrap-vue-next';

import { USANDO_MOCKS } from '@/config';
</script>
