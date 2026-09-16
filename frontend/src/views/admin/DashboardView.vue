<template>
  <section>
    <SecaoTitulo
      eyebrow="Painel"
      titulo="Visão geral"
      :descricao="`Bem-vindo, ${auth.usuario?.pesquisador?.nome ?? auth.usuario?.username ?? ''}.`"
      tag="h1"
    />

    <CarregandoBloco v-if="carregando" />

    <template v-else>
      <BRow class="g-3 mb-4">
        <BCol v-for="cartao in cartoes" :key="cartao.rotulo" sm="6" xl="3">
          <RouterLink
            :to="{ name: cartao.rota }"
            class="i2a-card d-block h-100 p-4 text-decoration-none text-body"
          >
            <p class="i2a-stat mb-1">{{ cartao.valor }}</p>
            <p class="i2a-meta mb-0">{{ cartao.rotulo }}</p>
          </RouterLink>
        </BCol>
      </BRow>

      <BRow class="g-3">
        <BCol lg="7">
          <div class="i2a-card p-4 h-100">
            <p class="i2a-eyebrow mb-3">Publicações por ano</p>

            <EstadoVazio
              v-if="!dados?.producaoPorAno?.length"
              icone="bi-bar-chart"
              titulo="Sem publicações cadastradas"
              descricao=""
            />

            <div v-else class="d-flex align-items-end gap-3 flex-wrap pt-2" style="min-height: 170px">
              <div v-for="linha in dados.producaoPorAno" :key="linha.ano" class="text-center" style="width: 52px">
                <div
                  class="rounded-top mx-auto"
                  :style="{
                    height: `${alturaBarra(linha.total)}px`,
                    width: '28px',
                    backgroundColor: 'var(--bs-primary)'
                  }"
                  :title="`${linha.total} publicações em ${linha.ano}`"
                />
                <small class="d-block fw-semibold mt-1">{{ linha.total }}</small>
                <small class="i2a-meta">{{ linha.ano }}</small>
              </div>
            </div>
          </div>
        </BCol>

        <BCol lg="5">
          <div class="i2a-card p-4 h-100">
            <p class="i2a-eyebrow mb-3">Atalhos</p>
            <div class="d-grid gap-2">
              <RouterLink
                v-for="atalho in atalhos"
                :key="atalho.rota"
                :to="{ name: atalho.rota }"
                class="btn btn-outline-secondary btn-sm text-start"
              >
                <i :class="`bi ${atalho.icone} me-2`" />{{ atalho.rotulo }}
              </RouterLink>
            </div>
          </div>
        </BCol>
      </BRow>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { BRow, BCol } from 'bootstrap-vue-next';

import SecaoTitulo from '@/components/comum/SecaoTitulo.vue';
import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { estatisticas } from '@/services/publicoService';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const dados = ref(null);
const carregando = ref(true);

const cartoes = computed(() => [
  { rotulo: 'Pesquisadores', valor: dados.value?.totalPesquisadores ?? 0, rota: 'admin-pesquisadores' },
  { rotulo: 'Projetos', valor: dados.value?.totalProjetos ?? 0, rota: 'admin-projetos' },
  { rotulo: 'Cursos', valor: dados.value?.totalCursos ?? 0, rota: 'admin-cursos' },
  { rotulo: 'Publicações', valor: dados.value?.totalProducoes ?? 0, rota: 'admin-producoes' }
]);

const atalhos = [
  { rota: 'admin-pesquisadores', rotulo: 'Cadastrar pesquisador', icone: 'bi-person-plus' },
  { rota: 'admin-projetos', rotulo: 'Cadastrar projeto', icone: 'bi-plus-square' },
  { rota: 'admin-producoes', rotulo: 'Cadastrar publicação', icone: 'bi-journal-plus' },
  { rota: 'admin-cursos', rotulo: 'Abrir inscrições de curso', icone: 'bi-calendar-plus' }
];

const maximo = computed(() =>
  Math.max(1, ...(dados.value?.producaoPorAno ?? []).map((l) => Number(l.total)))
);

function alturaBarra(total) {
  return Math.max(8, Math.round((Number(total) / maximo.value) * 130));
}

onMounted(async () => {
  try {
    dados.value = await estatisticas();
  } finally {
    carregando.value = false;
  }
});
</script>
