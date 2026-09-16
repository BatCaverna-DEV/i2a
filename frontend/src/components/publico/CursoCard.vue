<template>
  <BCard class="h-100 i2a-card-hover">
    <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
      <h3 class="h6 fw-semibold mb-0">{{ curso.titulo }}</h3>
      <BBadge :variant="aberto ? 'success' : 'secondary'">
        {{ aberto ? 'Inscrições abertas' : 'Fechado' }}
      </BBadge>
    </div>

    <p class="small text-body-secondary i2a-truncate-3">{{ curso.resumo || 'Sem resumo.' }}</p>

    <ul class="list-unstyled small mb-3">
      <li><i class="bi bi-calendar-event me-1" />Início: {{ formatarData(curso.inicio) }}</li>
      <li v-if="curso.inscricoes_fim">
        <i class="bi bi-clock me-1" />Inscrições até {{ formatarData(curso.inscricoes_fim) }}
      </li>
      <li v-if="curso.responsavel">
        <i class="bi bi-person me-1" />{{ curso.responsavel.nome }}
      </li>
    </ul>

    <BButton :to="{ name: 'curso', params: { id: curso.id } }" size="sm" variant="outline-primary">
      Detalhes
    </BButton>
  </BCard>
</template>

<script setup>
import { computed } from 'vue';
import { BCard, BBadge, BButton } from 'bootstrap-vue-next';

import { formatarData, inscricoesAbertas } from '@/utils/formatadores';

const props = defineProps({
  curso: { type: Object, required: true }
});

const aberto = computed(() => inscricoesAbertas(props.curso));
</script>
