<template>
  <BContainer class="py-5">
    <CarregandoBloco v-if="carregando" />

    <div v-else-if="dados">
      <BButton :to="{ name: 'pesquisadores' }" variant="link" class="ps-0 mb-3">
        <i class="bi bi-arrow-left me-1" />Voltar
      </BButton>

      <BRow class="g-4">
        <BCol lg="4">
          <BCard class="text-center">
            <div
              class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center mx-auto mb-3"
              style="width: 96px; height: 96px"
            >
              <i class="bi bi-person fs-1" />
            </div>
            <h1 class="h5 fw-bold mb-1">{{ dados.nome }}</h1>
            <p class="small text-body-secondary mb-2">{{ dados.email }}</p>
            <BBadge v-if="dados.linha" variant="secondary">{{ dados.linha.descricao }}</BBadge>
          </BCard>

          <BCard title="Titulações" class="mt-3">
            <EstadoVazio v-if="!dados.titulacoes?.length" icone="bi-award" titulo="Nenhuma titulação cadastrada" descricao="" />
            <ul v-else class="list-unstyled small mb-0">
              <li v-for="(t, i) in dados.titulacoes" :key="i" class="mb-2">
                <strong>{{ t.titulo }}</strong><br />
                <span class="text-body-secondary">{{ t.instituicao }} · {{ t.ano ?? '—' }}</span>
              </li>
            </ul>
          </BCard>
        </BCol>

        <BCol lg="8">
          <BCard title="Projetos" class="mb-3">
            <EstadoVazio v-if="!dados.projetos?.length" icone="bi-kanban" titulo="Nenhum projeto vinculado" descricao="" />
            <ul v-else class="list-group list-group-flush">
              <li v-for="p in dados.projetos" :key="p.id" class="list-group-item px-0 d-flex justify-content-between gap-2">
                <RouterLink :to="{ name: 'projeto', params: { id: p.id } }" class="text-decoration-none">
                  {{ p.titulo }}
                </RouterLink>
                <BBadge :variant="STATUS_PROJETO[p.status]?.variante ?? 'secondary'">
                  {{ STATUS_PROJETO[p.status]?.rotulo ?? '—' }}
                </BBadge>
              </li>
            </ul>
          </BCard>

          <BCard title="Produção científica">
            <EstadoVazio v-if="!dados.producoes?.length" icone="bi-journal-text" titulo="Nenhuma produção cadastrada" descricao="" />
            <ul v-else class="list-group list-group-flush">
              <li v-for="pr in dados.producoes" :key="pr.id" class="list-group-item px-0">
                <p class="mb-1 fw-semibold">{{ pr.titulo }}</p>
                <p class="small text-body-secondary mb-0">
                  {{ pr.veiculo || '—' }} · {{ pr.ano ?? 's/d' }} · {{ TIPO_PRODUCAO[pr.tipo] ?? '' }}
                  <a v-if="pr.doi" :href="`https://doi.org/${pr.doi}`" target="_blank" rel="noopener" class="ms-2">
                    DOI
                  </a>
                </p>
              </li>
            </ul>
          </BCard>
        </BCol>
      </BRow>
    </div>

    <EstadoVazio v-else icone="bi-exclamation-triangle" titulo="Pesquisador não encontrado" descricao="" />
  </BContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { BContainer, BRow, BCol, BCard, BBadge, BButton } from 'bootstrap-vue-next';

import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { pesquisador } from '@/services/publicoService';
import { STATUS_PROJETO, TIPO_PRODUCAO } from '@/utils/formatadores';

const props = defineProps({ id: { type: String, required: true } });

const dados = ref(null);
const carregando = ref(true);

onMounted(async () => {
  try {
    dados.value = await pesquisador(props.id);
  } catch {
    dados.value = null;
  } finally {
    carregando.value = false;
  }
});
</script>
