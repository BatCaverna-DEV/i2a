<template>
  <BContainer class="py-5">
    <BRow class="g-5">
      <BCol lg="7">
        <p class="i2a-eyebrow mb-3">Sobre</p>
        <h1 class="h2 fw-bold mb-4">
          Um grupo de pesquisa em IA no interior do Maranhão
        </h1>

        <div class="fs-6 text-body-secondary d-grid gap-3">
          <p class="mb-0">
            O <strong class="text-body">I2A — Inteligência Artificial e Aplicações</strong> é um
            grupo de pesquisa do {{ APP.instituicao }}, {{ APP.campus }}, dedicado ao estudo e à
            aplicação de técnicas de aprendizagem de máquina a problemas reais da região.
          </p>
          <p class="mb-0">
            O grupo nasceu dentro do curso de Análise e Desenvolvimento de Sistemas e articula
            ensino, pesquisa e extensão: os mesmos projetos que geram publicações também formam
            estudantes de iniciação científica e viram cursos abertos à comunidade.
          </p>
        </div>

        <hr class="i2a-rule my-5" />

        <SecaoTitulo titulo="Como trabalhamos" tag="h2" />
        <BRow class="g-4">
          <BCol sm="6" v-for="pilar in pilares" :key="pilar.titulo">
            <h3 class="h6 fw-semibold mb-1">{{ pilar.titulo }}</h3>
            <p class="small text-body-secondary mb-0">{{ pilar.texto }}</p>
          </BCol>
        </BRow>

        <hr class="i2a-rule my-5" />

        <SecaoTitulo titulo="Linhas de pesquisa" tag="h2" />
        <CarregandoBloco v-if="carregando" />
        <ul v-else class="list-unstyled d-grid gap-3 mb-0">
          <li v-for="l in linhasLista" :key="l.id" class="border-bottom pb-3">
            <p class="fw-semibold mb-1">{{ l.descricao }}</p>
            <RouterLink
              :to="{ name: 'pesquisadores', query: { linha: l.id } }"
              class="i2a-meta text-decoration-none"
            >
              Ver pesquisadores da linha →
            </RouterLink>
          </li>
        </ul>
      </BCol>

      <BCol lg="5">
        <div class="i2a-surface p-4 mb-3">
          <p class="i2a-eyebrow mb-3">O grupo em números</p>
          <BRow class="g-3">
            <BCol cols="6" v-for="n in numeros" :key="n.rotulo">
              <p class="i2a-stat mb-1">{{ n.valor }}</p>
              <p class="i2a-meta mb-0">{{ n.rotulo }}</p>
            </BCol>
          </BRow>
        </div>

        <div class="i2a-surface p-4">
          <p class="i2a-eyebrow mb-2">Quer fazer parte?</p>
          <p class="small text-body-secondary">
            O grupo recebe estudantes de graduação em iniciação científica, voluntariado e
            projetos de extensão ao longo de todo o ano.
          </p>
          <RouterLink :to="{ name: 'participe' }" class="btn btn-sm btn-primary">
            Ver oportunidades
          </RouterLink>
        </div>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { BContainer, BRow, BCol } from 'bootstrap-vue-next';

import SecaoTitulo from '@/components/comum/SecaoTitulo.vue';
import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import { APP } from '@/config';
import { estatisticas, linhas } from '@/services/publicoService';

const carregando = ref(true);
const dados = ref(null);
const linhasLista = ref([]);

const pilares = [
  {
    titulo: 'Problemas locais',
    texto: 'Pesquisa aplicada a questões do Maranhão e do cerrado — saúde, ambiente, gestão pública.'
  },
  {
    titulo: 'Formação desde a graduação',
    texto: 'Estudantes do ADS participam dos projetos como coautores, não apenas como executores.'
  },
  {
    titulo: 'Produção aberta',
    texto: 'Publicações, código e dados divulgados sempre que os acordos de pesquisa permitem.'
  },
  {
    titulo: 'Extensão',
    texto: 'Cursos e oficinas que devolvem à comunidade o que é produzido dentro do grupo.'
  }
];

const numeros = computed(() => [
  { rotulo: 'Pesquisadores', valor: dados.value?.totalPesquisadores ?? 0 },
  { rotulo: 'Linhas', valor: dados.value?.totalLinhas ?? 0 },
  { rotulo: 'Projetos', valor: dados.value?.totalProjetos ?? 0 },
  { rotulo: 'Publicações', valor: dados.value?.totalProducoes ?? 0 }
]);

onMounted(async () => {
  try {
    const [est, ln] = await Promise.all([estatisticas(), linhas()]);
    dados.value = est;
    linhasLista.value = ln.data;
  } finally {
    carregando.value = false;
  }
});
</script>
