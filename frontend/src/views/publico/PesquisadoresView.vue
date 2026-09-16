<template>
  <BContainer class="py-5">
    <SecaoTitulo
      eyebrow="Quem faz"
      titulo="Equipe"
      descricao="Professores, pesquisadores e estudantes vinculados ao grupo."
      tag="h1"
    />

    <BRow class="g-2 mb-4">
      <BCol md="5">
        <BFormInput
          v-model="busca"
          placeholder="Buscar por nome…"
          debounce="400"
          @update:model-value="carregar(1)"
        />
      </BCol>
      <BCol md="5">
        <BFormSelect
          v-model="linhaSelecionada"
          :options="opcoesLinhas"
          @update:model-value="carregar(1)"
        />
      </BCol>
    </BRow>

    <CarregandoBloco v-if="carregando" />

    <EstadoVazio v-else-if="!itens.length" icone="bi-people" titulo="Nenhum pesquisador encontrado" />

    <BRow v-else class="g-3">
      <BCol v-for="p in itens" :key="p.id" md="6" lg="4">
        <RouterLink
          :to="{ name: 'pesquisador', params: { id: p.id } }"
          class="i2a-card d-block h-100 p-4 text-decoration-none text-body"
        >
          <p v-if="p.papel" class="i2a-eyebrow mb-2">{{ p.papel }}</p>
          <h2 class="h6 fw-semibold mb-1">{{ p.nome }}</h2>
          <p class="i2a-meta mb-2">{{ p.linha?.descricao ?? 'Sem linha definida' }}</p>
          <p v-if="p.resumo" class="small text-body-secondary i2a-truncate-3 mb-0">
            {{ p.resumo }}
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
import { useRoute } from 'vue-router';
import { BContainer, BRow, BCol, BFormInput, BFormSelect, BPagination } from 'bootstrap-vue-next';

import SecaoTitulo from '@/components/comum/SecaoTitulo.vue';
import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { pesquisadores, linhas } from '@/services/publicoService';

const route = useRoute();

const itens = ref([]);
const meta = reactive({ total: 0, page: 1, limit: 24, totalPages: 1 });
const pagina = ref(1);
const busca = ref('');
// a home linka para cá já filtrando por linha (?linha=<id>)
const linhaSelecionada = ref(route.query.linha ?? null);
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
