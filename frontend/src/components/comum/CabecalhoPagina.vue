<template>
  <!-- Faixa azul-noite que abre as páginas internas do site público -->
  <header class="i2a-cabecalho">
    <BContainer>
      <RouterLink v-if="voltar" :to="voltar" class="i2a-cabecalho-voltar mb-3">
        <i class="bi bi-arrow-left" />{{ voltarRotulo }}
      </RouterLink>

      <p v-if="eyebrow" class="i2a-eyebrow mb-2">{{ eyebrow }}</p>
      <h1 v-if="titulo" class="display-6 fw-bold mb-0" style="max-width: 28ch">{{ titulo }}</h1>
      <p
        v-if="descricao"
        class="fs-5 text-body-secondary mt-3 mb-0"
        style="max-width: 62ch"
      >
        {{ descricao }}
      </p>

      <!-- conteúdo extra do cabeçalho (ex.: dados do perfil) -->
      <slot />
    </BContainer>
  </header>
</template>

<script setup>
import { BContainer } from 'bootstrap-vue-next';

defineProps({
  eyebrow: { type: String, default: '' },
  titulo: { type: String, default: '' },
  descricao: { type: String, default: '' },
  /** rota do link "voltar", ex.: { name: 'projetos' } */
  voltar: { type: Object, default: null },
  voltarRotulo: { type: String, default: 'Voltar' }
});
</script>
