<template>
  <div class="text-center py-5">
    <BSpinner variant="primary" />
    <p class="small text-body-secondary mt-2 mb-0">{{ texto }}</p>
  </div>
</template>

<script setup>
import { BSpinner } from 'bootstrap-vue-next';

defineProps({
  texto: { type: String, default: 'Carregando…' }
});
</script>
