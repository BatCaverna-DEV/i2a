<template>
  <div class="text-center text-body-secondary py-5">
    <span class="i2a-icone mb-3" :class="{ 'i2a-icone--vidro': escuro }" style="width: 3.5rem; height: 3.5rem; font-size: 1.5rem">
      <i :class="`bi ${icone}`" />
    </span>
    <p class="mb-1 fw-semibold" :class="escuro ? 'text-white' : 'text-body'">{{ titulo }}</p>
    <p v-if="descricao" class="small mb-0 mx-auto" style="max-width: 44ch">{{ descricao }}</p>
  </div>
</template>

<script setup>
defineProps({
  icone: { type: String, default: 'bi-inbox' },
  titulo: { type: String, default: 'Nada por aqui' },
  descricao: { type: String, default: 'Nenhum registro encontrado com os filtros atuais.' },
  /** usar sobre fundo escuro (seção azul-noite) */
  escuro: { type: Boolean, default: false }
});
</script>
