<template>
  <BContainer class="py-5">
    <CarregandoBloco v-if="carregando" />

    <BRow v-else-if="dados" class="justify-content-center">
      <BCol lg="8">
        <BButton :to="{ name: 'cursos' }" variant="link" class="ps-0 mb-3">
          <i class="bi bi-arrow-left me-1" />Voltar
        </BButton>

        <h1 class="h3 fw-bold mb-2">{{ dados.titulo }}</h1>

        <BBadge :variant="aberto ? 'success' : 'secondary'" class="mb-3">
          {{ aberto ? 'Inscrições abertas' : 'Inscrições fechadas' }}
        </BBadge>

        <p>{{ dados.resumo || 'Sem resumo cadastrado.' }}</p>

        <BCard class="mt-4">
          <dl class="row mb-0 small">
            <dt class="col-sm-4">Início do curso</dt>
            <dd class="col-sm-8">{{ formatarDataHora(dados.inicio) }}</dd>

            <dt class="col-sm-4">Inscrições</dt>
            <dd class="col-sm-8">
              {{ formatarDataHora(dados.inscricoes_inicio) }} até
              {{ formatarDataHora(dados.inscricoes_fim) }}
            </dd>

            <dt class="col-sm-4">Responsável</dt>
            <dd class="col-sm-8 mb-0">
              {{ dados.responsavel?.nome ?? '—' }}
              <span v-if="dados.responsavel?.email" class="text-body-secondary">
                · {{ dados.responsavel.email }}
              </span>
            </dd>
          </dl>
        </BCard>
      </BCol>
    </BRow>

    <EstadoVazio v-else icone="bi-exclamation-triangle" titulo="Curso não encontrado" descricao="" />
  </BContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { BContainer, BRow, BCol, BCard, BBadge, BButton } from 'bootstrap-vue-next';

import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { curso } from '@/services/publicoService';
import { formatarDataHora, inscricoesAbertas } from '@/utils/formatadores';

const props = defineProps({ id: { type: String, required: true } });

const dados = ref(null);
const carregando = ref(true);
const aberto = computed(() => inscricoesAbertas(dados.value));

onMounted(async () => {
  try {
    dados.value = await curso(props.id);
  } catch {
    dados.value = null;
  } finally {
    carregando.value = false;
  }
});
</script>
