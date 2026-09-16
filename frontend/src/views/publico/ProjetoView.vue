<template>
  <BContainer class="py-5">
    <CarregandoBloco v-if="carregando" />

    <div v-else-if="dados">
      <BButton :to="{ name: 'projetos' }" variant="link" class="ps-0 mb-3">
        <i class="bi bi-arrow-left me-1" />Voltar
      </BButton>

      <BRow class="g-4">
        <BCol lg="8">
          <h1 class="h3 fw-bold mb-2">{{ dados.titulo }}</h1>

          <div class="d-flex gap-2 mb-3">
            <BBadge :variant="STATUS_PROJETO[dados.status]?.variante ?? 'secondary'">
              {{ STATUS_PROJETO[dados.status]?.rotulo ?? '—' }}
            </BBadge>
            <BBadge variant="light" class="text-dark border">{{ TIPO_PROJETO[dados.tipo] ?? '—' }}</BBadge>
          </div>

          <p>{{ dados.resumo || 'Sem resumo cadastrado.' }}</p>
        </BCol>

        <BCol lg="4">
          <BCard title="Coordenação">
            <p class="mb-0">{{ dados.coordenador?.nome ?? '—' }}</p>
          </BCard>

          <BCard title="Equipe" class="mt-3">
            <EstadoVazio v-if="!dados.equipe?.length" icone="bi-people" titulo="Equipe não cadastrada" descricao="" />
            <ul v-else class="list-unstyled mb-0">
              <li v-for="m in dados.equipe" :key="m.id">
                <RouterLink :to="{ name: 'pesquisador', params: { id: m.id } }" class="text-decoration-none">
                  {{ m.nome }}
                </RouterLink>
              </li>
            </ul>
          </BCard>
        </BCol>
      </BRow>
    </div>

    <EstadoVazio v-else icone="bi-exclamation-triangle" titulo="Projeto não encontrado" descricao="" />
  </BContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { BContainer, BRow, BCol, BCard, BBadge, BButton } from 'bootstrap-vue-next';

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
