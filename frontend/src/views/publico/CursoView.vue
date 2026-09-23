<template>
  <div>
    <BContainer v-if="carregando" class="py-5"><CarregandoBloco /></BContainer>

    <template v-else-if="dados">
      <CabecalhoPagina
        :voltar="{ name: 'cursos' }"
        voltar-rotulo="Cursos"
        :titulo="dados.titulo"
      >
        <span class="i2a-selo mt-3" :class="aberto ? 'i2a-selo--ciano' : 'i2a-selo--vidro'">
          <i class="bi me-1" :class="aberto ? 'bi-unlock' : 'bi-lock'" />
          {{ aberto ? 'Inscrições abertas' : 'Inscrições fechadas' }}
        </span>
      </CabecalhoPagina>

      <BContainer class="py-5">
        <BRow class="g-4">
          <BCol lg="8">
            <div class="i2a-painel p-4 p-lg-5 h-100">
              <p class="i2a-eyebrow i2a-eyebrow--traco mb-3">Sobre o curso</p>
              <!-- white-space: pre-line mantém os parágrafos digitados no painel -->
              <p class="fs-6 text-body-secondary mb-0" style="white-space: pre-line">
                {{ dados.resumo || 'Sem resumo cadastrado.' }}
              </p>
            </div>
          </BCol>

          <BCol lg="4">
            <div class="i2a-surface p-4">
              <ul class="list-unstyled d-grid gap-4 mb-0 small">
                <li class="d-flex gap-3">
                  <span class="i2a-icone"><i class="bi bi-calendar-event" /></span>
                  <div>
                    <p class="i2a-eyebrow mb-1">Início do curso</p>
                    {{ formatarDataHora(dados.inicio) }}
                  </div>
                </li>
                <li class="d-flex gap-3">
                  <span class="i2a-icone i2a-icone--ciano"><i class="bi bi-pencil-square" /></span>
                  <div>
                    <p class="i2a-eyebrow mb-1">Inscrições</p>
                    {{ formatarDataHora(dados.inscricoes_inicio) }}<br />
                    até {{ formatarDataHora(dados.inscricoes_fim) }}
                  </div>
                </li>
                <li class="d-flex gap-3">
                  <span class="i2a-icone i2a-icone--violeta"><i class="bi bi-person-badge" /></span>
                  <div>
                    <p class="i2a-eyebrow mb-1">Responsável</p>
                    {{ dados.responsavel?.nome ?? '—' }}
                    <span v-if="dados.responsavel?.email" class="d-block i2a-meta">
                      {{ dados.responsavel.email }}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </BCol>
        </BRow>
      </BContainer>
    </template>

    <BContainer v-else class="py-5">
      <EstadoVazio icone="bi-exclamation-circle" titulo="Curso não encontrado" descricao="" />
    </BContainer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { BContainer, BRow, BCol } from 'bootstrap-vue-next';

import CabecalhoPagina from '@/components/comum/CabecalhoPagina.vue';
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
