<template>
  <div>
    <CabecalhoPagina
      eyebrow="Produção científica"
      titulo="Publicações"
      descricao="Artigos, capítulos, livros e softwares produzidos por membros do grupo."
    />

    <BContainer class="py-5">
      <BRow class="g-2 mb-4">
        <BCol md="5">
          <BFormInput
            v-model="busca"
            placeholder="Buscar por título ou veículo…"
            debounce="400"
            @update:model-value="carregar(1)"
          />
        </BCol>
        <BCol md="4">
          <BFormSelect v-model="tipo" :options="opcoesTipo" @update:model-value="carregar(1)" />
        </BCol>
        <BCol md="3">
          <BFormInput
            v-model="ano"
            type="number"
            placeholder="Ano"
            debounce="500"
            @update:model-value="carregar(1)"
          />
        </BCol>
      </BRow>

      <CarregandoBloco v-if="carregando" />
      <EstadoVazio
        v-else-if="!itens.length"
        icone="bi-journal-text"
        titulo="Nenhuma publicação encontrada"
      />

      <ul v-else class="i2a-painel i2a-lista-cartao list-unstyled mb-0">
        <li v-for="p in itens" :key="p.id" class="p-4">
          <p class="fw-semibold mb-1">{{ p.titulo }}</p>

          <p class="small text-body-secondary mb-1">
            {{ p.autores?.map((a) => a.nome).join('; ') || 'Autoria não informada' }}
          </p>

          <p class="i2a-meta mb-0 d-flex flex-wrap gap-2 align-items-center">
            <span class="i2a-selo">
              {{ TIPO_PRODUCAO[p.tipo] ?? '—' }}
            </span>
            <span>{{ p.veiculo || '—' }} · {{ p.ano ?? 's/d' }}</span>
            <span v-if="p.qualis">Qualis {{ p.qualis }}</span>
            <a v-if="p.doi" :href="`https://doi.org/${p.doi}`" target="_blank" rel="noopener">DOI</a>
            <a v-else-if="p.url" :href="p.url" target="_blank" rel="noopener">Acessar</a>
          </p>
        </li>
      </ul>

      <div v-if="meta.totalPages > 1" class="d-flex justify-content-center mt-4">
        <BPagination
          v-model="pagina"
          :total-rows="meta.total"
          :per-page="meta.limit"
          @update:model-value="carregar"
        />
      </div>
    </BContainer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { BContainer, BRow, BCol, BFormInput, BFormSelect, BPagination } from 'bootstrap-vue-next';

import CabecalhoPagina from '@/components/comum/CabecalhoPagina.vue';
import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { producoes } from '@/services/publicoService';
import { TIPO_PRODUCAO } from '@/utils/formatadores';

const itens = ref([]);
const meta = reactive({ total: 0, page: 1, limit: 20, totalPages: 1 });
const pagina = ref(1);
const busca = ref('');
const tipo = ref(null);
const ano = ref('');
const carregando = ref(true);

const opcoesTipo = [
  { value: null, text: 'Todos os tipos' },
  ...Object.entries(TIPO_PRODUCAO).map(([value, text]) => ({ value: Number(value), text }))
];

async function carregar(novaPagina = pagina.value) {
  carregando.value = true;
  try {
    const resposta = await producoes({
      page: novaPagina,
      limit: meta.limit,
      q: busca.value || undefined,
      tipo: tipo.value ?? undefined,
      ano: ano.value || undefined
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
