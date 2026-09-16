<template>
  <header class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
    <div>
      <h1 class="h4 fw-bold mb-1">{{ titulo }}</h1>
      <p v-if="subtitulo" class="text-body-secondary small mb-0">{{ subtitulo }}</p>
    </div>

    <div class="d-flex gap-2">
      <slot name="acoes" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' }
});
</script>
