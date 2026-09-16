<template>
  <RouterLink
    :to="{ name: 'curso', params: { id: curso.id } }"
    class="i2a-card d-block h-100 p-4 text-decoration-none text-body"
  >
    <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
      <h3 class="h6 fw-semibold mb-0">{{ curso.titulo }}</h3>
      <span class="i2a-meta text-nowrap" :class="aberto ? 'text-primary fw-semibold' : ''">
        {{ aberto ? 'Inscrições abertas' : 'Fechado' }}
      </span>
    </div>

    <p class="small text-body-secondary i2a-truncate-3 mb-3">
      {{ curso.resumo || 'Sem resumo.' }}
    </p>

    <ul class="list-unstyled i2a-meta mb-0 d-grid gap-1">
      <li>Início: {{ formatarData(curso.inicio) }}</li>
      <li v-if="curso.inscricoes_fim">
        Inscrições até {{ formatarData(curso.inscricoes_fim) }}
      </li>
      <li v-if="curso.responsavel">{{ curso.responsavel.nome }}</li>
    </ul>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue';

import { formatarData, inscricoesAbertas } from '@/utils/formatadores';

const props = defineProps({
  curso: { type: Object, required: true }
});

const aberto = computed(() => inscricoesAbertas(props.curso));
</script>
