<template>
  <BContainer class="py-5">
    <CarregandoBloco v-if="carregando" />

    <div v-else-if="dados">
      <RouterLink :to="{ name: 'projetos' }" class="i2a-meta text-decoration-none">
        <i class="bi bi-arrow-left me-1" />Projetos
      </RouterLink>

      <BRow class="g-5 mt-0">
        <BCol lg="8">
          <p class="i2a-eyebrow mb-2">
            {{ TIPO_PROJETO[dados.tipo] ?? '—' }} · {{ STATUS_PROJETO[dados.status]?.rotulo }}
          </p>
          <h1 class="h2 fw-bold mb-3">{{ dados.titulo }}</h1>
          <!-- white-space: pre-line mantém os parágrafos digitados no painel -->
          <p class="fs-6 text-body-secondary mb-0" style="white-space: pre-line">
            {{ dados.resumo || 'Sem resumo cadastrado.' }}
          </p>
        </BCol>

        <BCol lg="4">
          <div class="i2a-surface p-4">
            <p class="i2a-eyebrow mb-2">Coordenação</p>
            <p class="small mb-4">{{ dados.coordenador?.nome ?? '—' }}</p>

            <p class="i2a-eyebrow mb-2">Equipe</p>
            <EstadoVazio
              v-if="!dados.equipe?.length"
              icone="bi-people"
              titulo="Equipe não cadastrada"
              descricao=""
            />
            <ul v-else class="list-unstyled d-grid gap-1 mb-0 small">
              <li v-for="m in dados.equipe" :key="m.id">
                <RouterLink
                  :to="{ name: 'pesquisador', params: { id: m.id } }"
                  class="link-dark text-decoration-none"
                >
                  {{ m.nome }}
                </RouterLink>
              </li>
            </ul>
          </div>
        </BCol>
      </BRow>
    </div>

    <EstadoVazio v-else icone="bi-exclamation-circle" titulo="Projeto não encontrado" descricao="" />
  </BContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { BContainer, BRow, BCol } from 'bootstrap-vue-next';

import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { projeto } from '@/services/publicoService';
import { STATUS_PROJETO, TIPO_PROJETO } from '@/utils/formatadores';

const props = defineProps({ id: { type: String, required: true } });

const dados = ref(null);
const carregando = ref(true);

onMounted(async () => {
  try {
    dados.value = await projeto(props.id);
  } catch {
    dados.value = null;
  } finally {
    carregando.value = false;
  }
});
</script>
