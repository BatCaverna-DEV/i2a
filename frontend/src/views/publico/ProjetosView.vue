<template>
  <BContainer class="py-5">
    <h1 class="h3 fw-bold mb-4">Projetos</h1>

    <BRow class="g-2 mb-4">
      <BCol md="4">
        <BFormSelect v-model="tipo" :options="opcoesTipo" @update:model-value="carregar(1)" />
      </BCol>
      <BCol md="4">
        <BFormSelect v-model="status" :options="opcoesStatus" @update:model-value="carregar(1)" />
      </BCol>
    </BRow>

    <CarregandoBloco v-if="carregando" />
    <EstadoVazio v-else-if="!itens.length" icone="bi-kanban" titulo="Nenhum projeto encontrado" />

    <BRow v-else class="g-3">
      <BCol v-for="p in itens" :key="p.id" md="6" lg="4">
        <BCard class="h-100 i2a-card-hover">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h2 class="h6 fw-semibold mb-0">{{ p.titulo }}</h2>
            <BBadge :variant="STATUS_PROJETO[p.status]?.variante ?? 'secondary'">
              {{ STATUS_PROJETO[p.status]?.rotulo ?? '—' }}
            </BBadge>
          </div>

          <p class="small text-body-secondary i2a-truncate-3">{{ p.resumo || 'Sem resumo.' }}</p>

          <p class="small mb-3">
            <i class="bi bi-tag me-1" />{{ TIPO_PROJETO[p.tipo] ?? '—' }}
            <span v-if="p.coordenador"> · <i class="bi bi-person me-1" />{{ p.coordenador.nome }}</span>
          </p>

          <BButton :to="{ name: 'projeto', params: { id: p.id } }" size="sm" variant="outline-primary">
            Detalhes
          </BButton>
        </BCard>
      </BCol>
    </BRow>

    <div v-if="meta.totalPages > 1" class="d-flex justify-content-center mt-4">
      <BPagination v-model="pagina" :total-rows="meta.total" :per-page="meta.limit" @update:model-value="carregar" />
    </div>
  </BContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import {
  BContainer,
  BRow,
  BCol,
  BCard,
  BBadge,
  BButton,
  BFormSelect,
  BPagination
} from 'bootstrap-vue-next';

import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { projetos } from '@/services/publicoService';
import { STATUS_PROJETO, TIPO_PROJETO } from '@/utils/formatadores';

const itens = ref([]);
const meta = reactive({ total: 0, page: 1, limit: 12, totalPages: 1 });
const pagina = ref(1);
const tipo = ref(null);
const status = ref(null);
const carregando = ref(true);

const opcoesTipo = [
  { value: null, text: 'Todos os tipos' },
  ...Object.entries(TIPO_PROJETO).map(([value, text]) => ({ value: Number(value), text }))
];

const opcoesStatus = [
  { value: null, text: 'Todas as situações' },
  ...Object.entries(STATUS_PROJETO).map(([value, v]) => ({ value: Number(value), text: v.rotulo }))
];

async function carregar(novaPagina = pagina.value) {
  carregando.value = true;
  try {
    const resposta = await projetos({
      page: novaPagina,
      limit: meta.limit,
      tipo: tipo.value ?? undefined,
      status: status.value ?? undefined
    });
    itens.value = resposta.data;
    Object.assign(meta, resposta.meta);
    pagina.value = resposta.meta.page;
  } finally {
    carregando.value = false;
  }
}

onMounted(() => carregar(1));
</script>
