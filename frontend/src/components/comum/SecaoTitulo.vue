<template>
  <div class="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
    <div>
      <p v-if="eyebrow" class="i2a-eyebrow mb-1">{{ eyebrow }}</p>
      <component :is="tag" class="h4 fw-bold mb-1">{{ titulo }}</component>
      <p v-if="descricao" class="text-body-secondary mb-0" style="max-width: 60ch">
        {{ descricao }}
      </p>
    </div>
    <slot name="acao" />
  </div>
</template>

<script setup>
defineProps({
  titulo: { type: String, required: true },
  eyebrow: { type: String, default: '' },
  descricao: { type: String, default: '' },
  tag: { type: String, default: 'h2' }
});
</script>
