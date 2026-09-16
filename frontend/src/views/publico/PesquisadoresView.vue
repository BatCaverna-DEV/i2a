<template>
  <BContainer class="py-5">
    <h1 class="h3 fw-bold mb-4">Pesquisadores</h1>

    <BRow class="g-2 mb-4">
      <BCol md="6">
        <BFormInput v-model="busca" placeholder="Buscar por nome…" debounce="400" @update:model-value="carregar(1)" />
      </BCol>
      <BCol md="6">
        <BFormSelect v-model="linhaSelecionada" :options="opcoesLinhas" @update:model-value="carregar(1)" />
      </BCol>
    </BRow>

    <CarregandoBloco v-if="carregando" />

    <EstadoVazio v-else-if="!itens.length" icone="bi-people" titulo="Nenhum pesquisador encontrado" />

    <BRow v-else class="g-3">
      <BCol v-for="p in itens" :key="p.id" md="6" lg="4">
        <BCard class="h-100 i2a-card-hover">
          <div class="d-flex align-items-center gap-3 mb-2">
            <div class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                 style="width: 48px; height: 48px">
              <i class="bi bi-person fs-4" />
            </div>
            <div class="min-w-0">
              <h2 class="h6 fw-semibold mb-0 text-truncate">{{ p.nome }}</h2>
              <p class="small text-body-secondary mb-0 text-truncate">{{ p.email }}</p>
            </div>
          </div>

          <BBadge v-if="p.linha" variant="secondary" class="mb-3">{{ p.linha.descricao }}</BBadge>

          <div>
            <BButton
              :to="{ name: 'pesquisador', params: { id: p.id } }"
              size="sm"
              variant="outline-primary"
            >
              Ver perfil
            </BButton>
          </div>
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
  BFormInput,
  BFormSelect,
  BPagination
} from 'bootstrap-vue-next';

import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { pesquisadores, linhas } from '@/services/publicoService';

const itens = ref([]);
const meta = reactive({ total: 0, page: 1, limit: 24, totalPages: 1 });
const pagina = ref(1);
const busca = ref('');
const linhaSelecionada = ref(null);
const opcoesLinhas = ref([{ value: null, text: 'Todas as linhas' }]);
const carregando = ref(true);

async function carregar(novaPagina = pagina.value) {
  carregando.value = true;
  try {
    const resposta = await pesquisadores({
      page: novaPagina,
      limit: meta.limit,
      q: busca.value || undefined,
      linha: linhaSelecionada.value || undefined
    });
    itens.value = resposta.data;
    Object.assign(meta, resposta.meta);
    pagina.value = resposta.meta.page;
  } finally {
    carregando.value = false;
  }
}

onMounted(async () => {
  const { data } = await linhas();
  opcoesLinhas.value = [
    { value: null, text: 'Todas as linhas' },
    ...data.map((l) => ({ value: l.id, text: l.descricao }))
  ];
  await carregar(1);
});
</script>
