<template>
  <BContainer class="py-5">
    <SecaoTitulo
      eyebrow="O que estamos fazendo"
      titulo="Projetos"
      descricao="Pesquisa, extensão, desenvolvimento e ensino conduzidos pelo grupo."
      tag="h1"
    />

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
      <BCol v-for="p in itens" :key="p.id" md="6">
        <RouterLink
          :to="{ name: 'projeto', params: { id: p.id } }"
          class="i2a-card d-block h-100 p-4 text-decoration-none text-body"
        >
          <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
            <h2 class="h6 fw-semibold mb-0">{{ p.titulo }}</h2>
            <span class="i2a-meta text-nowrap">{{ STATUS_PROJETO[p.status]?.rotulo }}</span>
          </div>
          <p class="small text-body-secondary i2a-truncate-3 mb-3">
            {{ p.resumo || 'Sem resumo.' }}
          </p>
          <p class="i2a-meta mb-0">
            {{ TIPO_PROJETO[p.tipo] ?? '—' }}
            <span v-if="p.ano"> · {{ p.ano }}</span>
            <span v-if="p.coordenador"> · {{ p.coordenador.nome }}</span>
          </p>
        </RouterLink>
      </BCol>
    </BRow>

    <div v-if="meta.totalPages > 1" class="d-flex justify-content-center mt-4">
      <BPagination
        v-model="pagina"
        :total-rows="meta.total"
        :per-page="meta.limit"
        @update:model-value="carregar"
      />
    </div>
  </BContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { BContainer, BRow, BCol, BFormSelect, BPagination } from 'bootstrap-vue-next';

import SecaoTitulo from '@/components/comum/SecaoTitulo.vue';
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
