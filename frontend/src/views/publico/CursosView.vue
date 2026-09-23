<template>
  <div>
    <CabecalhoPagina
      eyebrow="Formação"
      titulo="Cursos"
      descricao="Cursos, minicursos e oficinas ofertados pelo grupo à comunidade acadêmica e externa."
    />

    <BContainer class="py-5">
      <BFormCheckbox v-model="somenteAbertos" switch class="mb-4" @update:model-value="carregar(1)">
        Mostrar apenas cursos com inscrições abertas
      </BFormCheckbox>

      <CarregandoBloco v-if="carregando" />
      <EstadoVazio v-else-if="!itens.length" icone="bi-mortarboard" titulo="Nenhum curso encontrado" />

      <BRow v-else class="g-3">
        <BCol v-for="c in itens" :key="c.id" md="6" lg="4">
          <CursoCard :curso="c" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { BContainer, BRow, BCol, BFormCheckbox, BPagination } from 'bootstrap-vue-next';

import CabecalhoPagina from '@/components/comum/CabecalhoPagina.vue';
import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import CursoCard from '@/components/publico/CursoCard.vue';
import { cursos } from '@/services/publicoService';

const itens = ref([]);
const meta = reactive({ total: 0, page: 1, limit: 12, totalPages: 1 });
const pagina = ref(1);
const somenteAbertos = ref(false);
const carregando = ref(true);

async function carregar(novaPagina = pagina.value) {
  carregando.value = true;
  try {
    const resposta = await cursos({
      page: novaPagina,
      limit: meta.limit,
      abertos: somenteAbertos.value ? '1' : undefined
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
