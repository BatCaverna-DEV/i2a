<template>
  <div>
    <section class="i2a-hero py-5">
      <BContainer class="py-4">
        <BRow class="align-items-center g-4">
          <BCol lg="7">
            <h1 class="display-5 fw-bold mb-3">Grupo de Pesquisa I2A</h1>
            <p class="lead mb-4">
              Inteligência Artificial e Aplicações — pesquisa, extensão e formação no IFMA,
              Campus Coelho Neto.
            </p>
            <div class="d-flex flex-wrap gap-2">
              <BButton :to="{ name: 'projetos' }" variant="light" size="lg">
                Conhecer os projetos
              </BButton>
              <BButton :to="{ name: 'pesquisadores' }" variant="outline-light" size="lg">
                Nossa equipe
              </BButton>
            </div>
          </BCol>

          <BCol lg="5">
            <BRow class="g-3">
              <BCol v-for="n in numeros" :key="n.rotulo" cols="6">
                <div class="bg-white bg-opacity-10 rounded p-3 text-center">
                  <p class="h2 fw-bold mb-0">{{ n.valor }}</p>
                  <p class="small mb-0 text-white-50">{{ n.rotulo }}</p>
                </div>
              </BCol>
            </BRow>
          </BCol>
        </BRow>
      </BContainer>
    </section>

    <BContainer class="py-5">
      <h2 class="h4 fw-bold mb-3">Linhas de pesquisa</h2>
      <CarregandoBloco v-if="carregando" />
      <BRow v-else class="g-3">
        <BCol v-for="linha in linhasLista" :key="linha.id" md="6" lg="4">
          <BCard class="h-100 i2a-card-hover">
            <h3 class="h6 fw-semibold">{{ linha.descricao }}</h3>
            <p class="small text-body-secondary mb-0">
              {{ linha.total_pesquisadores }} pesquisador(es)
            </p>
          </BCard>
        </BCol>
      </BRow>
    </BContainer>

    <BContainer class="pb-5">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h4 fw-bold mb-0">Cursos com inscrições abertas</h2>
        <RouterLink :to="{ name: 'cursos' }" class="small text-decoration-none">Ver todos</RouterLink>
      </div>

      <EstadoVazio
        v-if="!cursosAbertos.length"
        icone="bi-mortarboard"
        titulo="Nenhuma inscrição aberta"
        descricao="Acompanhe esta página para saber das próximas ofertas."
      />

      <BRow v-else class="g-3">
        <BCol v-for="curso in cursosAbertos" :key="curso.id" md="6" lg="4">
          <CursoCard :curso="curso" />
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { BContainer, BRow, BCol, BCard, BButton } from 'bootstrap-vue-next';

import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import CursoCard from '@/components/publico/CursoCard.vue';
import { estatisticas, linhas, cursos } from '@/services/publicoService';

const carregando = ref(true);
const dados = ref(null);
const linhasLista = ref([]);
const cursosAbertos = ref([]);

const numeros = computed(() => [
  { rotulo: 'Pesquisadores', valor: dados.value?.totalPesquisadores ?? 0 },
  { rotulo: 'Projetos', valor: dados.value?.totalProjetos ?? 0 },
  { rotulo: 'Cursos', valor: dados.value?.totalCursos ?? 0 },
  { rotulo: 'Publicações', valor: dados.value?.totalProducoes ?? 0 }
]);

onMounted(async () => {
  try {
    const [est, ln, cs] = await Promise.all([
      estatisticas(),
      linhas(),
      cursos({ abertos: '1', limit: 3 })
    ]);
    dados.value = est;
    linhasLista.value = ln.data;
    cursosAbertos.value = cs.data;
  } finally {
    carregando.value = false;
  }
});
</script>
