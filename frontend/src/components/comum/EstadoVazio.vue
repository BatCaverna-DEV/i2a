<template>
  <div class="text-center text-body-secondary py-5">
    <i :class="`bi ${icone} fs-1 d-block mb-2 opacity-50`" />
    <p class="mb-1 fw-semibold">{{ titulo }}</p>
    <p class="small mb-0">{{ descricao }}</p>
  </div>
</template>

<script setup>
defineProps({
  icone: { type: String, default: 'bi-inbox' },
  titulo: { type: String, default: 'Nada por aqui' },
  descricao: { type: String, default: 'Nenhum registro encontrado com os filtros atuais.' }
});
</script>
