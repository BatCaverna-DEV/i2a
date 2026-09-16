<template>
  <BContainer class="py-5">
    <CarregandoBloco v-if="carregando" />

    <div v-else-if="dados">
      <RouterLink :to="{ name: 'cursos' }" class="i2a-meta text-decoration-none">
        <i class="bi bi-arrow-left me-1" />Cursos
      </RouterLink>

      <BRow class="g-5 mt-0">
        <BCol lg="8">
          <p class="i2a-eyebrow mb-2">
            {{ aberto ? 'Inscrições abertas' : 'Inscrições fechadas' }}
          </p>
          <h1 class="h2 fw-bold mb-3">{{ dados.titulo }}</h1>
          <!-- white-space: pre-line mantém os parágrafos digitados no painel -->
          <p class="fs-6 text-body-secondary" style="white-space: pre-line">
            {{ dados.resumo || 'Sem resumo cadastrado.' }}
          </p>
        </BCol>

        <BCol lg="4">
          <div class="i2a-surface p-4">
            <dl class="mb-0 small">
              <dt class="i2a-eyebrow fw-normal">Início do curso</dt>
              <dd class="mb-3">{{ formatarDataHora(dados.inicio) }}</dd>

              <dt class="i2a-eyebrow fw-normal">Inscrições</dt>
              <dd class="mb-3">
                {{ formatarDataHora(dados.inscricoes_inicio) }}<br />
                até {{ formatarDataHora(dados.inscricoes_fim) }}
              </dd>

              <dt class="i2a-eyebrow fw-normal">Responsável</dt>
              <dd class="mb-0">
                {{ dados.responsavel?.nome ?? '—' }}
                <span v-if="dados.responsavel?.email" class="d-block i2a-meta">
                  {{ dados.responsavel.email }}
                </span>
              </dd>
            </dl>
          </div>
        </BCol>
      </BRow>
    </div>

    <EstadoVazio v-else icone="bi-exclamation-circle" titulo="Curso não encontrado" descricao="" />
  </BContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { BContainer, BRow, BCol } from 'bootstrap-vue-next';

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
