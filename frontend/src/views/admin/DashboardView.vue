<template>
  <section>
    <PageHeader
      titulo="Painel"
      :subtitulo="`Bem-vindo, ${auth.usuario?.pesquisador?.nome ?? auth.usuario?.username ?? ''}`"
    />

    <CarregandoBloco v-if="carregando" />

    <BRow v-else class="g-3">
      <BCol v-for="cartao in cartoes" :key="cartao.rotulo" sm="6" xl="3">
        <BCard class="h-100 i2a-card-hover">
          <div class="d-flex align-items-center gap-3">
            <div class="rounded-circle bg-primary-subtle text-primary p-3 lh-1">
              <i :class="`bi ${cartao.icone} fs-4`" />
            </div>
            <div>
              <p class="display-6 fw-bold mb-0 lh-1">{{ cartao.valor }}</p>
              <p class="small text-body-secondary mb-0">{{ cartao.rotulo }}</p>
            </div>
          </div>
        </BCard>
      </BCol>

      <BCol cols="12">
        <BCard title="Produção científica por ano">
          <EstadoVazio
            v-if="!dados?.producaoPorAno?.length"
            icone="bi-bar-chart"
            titulo="Sem produções cadastradas"
            descricao="Cadastre artigos, capítulos e livros em Produção científica."
          />
          <div v-else class="d-flex align-items-end gap-3 flex-wrap pt-3" style="min-height: 180px">
            <div
              v-for="linha in dados.producaoPorAno"
              :key="linha.ano"
              class="text-center"
              style="width: 56px"
            >
              <div
                class="bg-primary rounded-top mx-auto"
                :style="{ height: `${alturaBarra(linha.total)}px`, width: '32px' }"
                :title="`${linha.total} produções em ${linha.ano}`"
              />
              <small class="d-block fw-semibold">{{ linha.total }}</small>
              <small class="text-body-secondary">{{ linha.ano }}</small>
            </div>
          </div>
        </BCard>
      </BCol>
    </BRow>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { BRow, BCol, BCard } from 'bootstrap-vue-next';

import PageHeader from '@/components/comum/PageHeader.vue';
import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { estatisticas } from '@/services/publicoService';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const dados = ref(null);
const carregando = ref(true);

const cartoes = computed(() => [
  { rotulo: 'Pesquisadores', valor: dados.value?.totalPesquisadores ?? 0, icone: 'bi-people' },
  { rotulo: 'Projetos', valor: dados.value?.totalProjetos ?? 0, icone: 'bi-kanban' },
  { rotulo: 'Cursos', valor: dados.value?.totalCursos ?? 0, icone: 'bi-mortarboard' },
  { rotulo: 'Produções', valor: dados.value?.totalProducoes ?? 0, icone: 'bi-journal-text' }
]);

const maximo = computed(() =>
  Math.max(1, ...(dados.value?.producaoPorAno ?? []).map((l) => Number(l.total)))
);

function alturaBarra(total) {
  return Math.max(8, Math.round((Number(total) / maximo.value) * 140));
}

onMounted(async () => {
  try {
    dados.value = await estatisticas();
  } finally {
    carregando.value = false;
  }
});
</script>
