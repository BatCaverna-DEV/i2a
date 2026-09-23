<template>
  <div>
    <!-- ------------------------- abertura ------------------------- -->
    <section class="i2a-hero py-5">
      <BContainer class="py-lg-5">
        <BRow class="align-items-center g-5">
          <BCol lg="7">
            <span class="i2a-selo i2a-selo--vidro mb-4">
              <i class="bi bi-geo-alt me-1" />{{ APP.instituicao }} · {{ APP.campus }}
            </span>
            <h1 class="display-4 fw-bold mb-3" style="max-width: 16ch">
              Inteligência Artificial
              <span class="d-block i2a-texto-gradiente">e Aplicações</span>
            </h1>
            <p class="fs-5 text-body-secondary mb-4" style="max-width: 56ch">
              O I2A reúne professores e estudantes do IFMA em torno de aprendizagem de máquina
              e suas aplicações — da saúde ao sensoriamento remoto, do ensino à gestão pública.
            </p>
            <div class="d-flex flex-wrap gap-2">
              <RouterLink :to="{ name: 'projetos' }" class="btn btn-ciano btn-lg px-4">
                Ver projetos <i class="bi bi-arrow-right ms-1" />
              </RouterLink>
              <RouterLink :to="{ name: 'participe' }" class="btn btn-outline-light btn-lg px-4">
                Participe do grupo
              </RouterLink>
            </div>
          </BCol>

          <BCol lg="5">
            <BRow class="g-3">
              <BCol v-for="n in numeros" :key="n.rotulo" cols="6">
                <div class="i2a-hero-stat p-3 p-xl-4 h-100">
                  <i :class="`bi ${n.icone} fs-4 d-block mb-3`" />
                  <p class="i2a-stat i2a-stat--claro mb-1">{{ n.valor }}</p>
                  <p class="small mb-0" style="color: rgba(255, 255, 255, 0.7)">
                    {{ n.rotulo }}
                  </p>
                </div>
              </BCol>
            </BRow>
          </BCol>
        </BRow>
      </BContainer>
    </section>

    <div class="i2a-faixa" />

    <!-- --------------------- linhas de pesquisa ------------------- -->
    <section class="py-5">
      <BContainer class="py-lg-4">
        <SecaoTitulo
          eyebrow="O que pesquisamos"
          titulo="Linhas de pesquisa"
          descricao="Cada linha reúne projetos, orientações e publicações em torno de um eixo temático."
        />

        <CarregandoBloco v-if="carregando" />

        <div v-else-if="!linhasLista.length" class="i2a-painel">
          <EstadoVazio
            icone="bi-diagram-3"
            titulo="Linhas de pesquisa em definição"
            descricao="As linhas do grupo aparecem aqui assim que forem cadastradas no painel."
          />
        </div>

        <BRow v-else class="g-3">
          <BCol v-for="(linha, i) in linhasLista" :key="linha.id" md="6" lg="4">
            <RouterLink
              :to="{ name: 'pesquisadores', query: { linha: linha.id } }"
              class="i2a-card d-flex flex-column h-100 p-4 text-decoration-none text-body"
            >
              <span class="i2a-icone mb-3" :class="corDaLinha(i).classe">
                <i :class="`bi ${corDaLinha(i).icone}`" />
              </span>
              <h3 class="h6 fw-semibold mb-3 flex-grow-1">{{ linha.descricao }}</h3>
              <span class="i2a-meta d-flex justify-content-between align-items-center">
                <span>
                  <i class="bi bi-people me-1" />{{ linha.total_pesquisadores ?? 0 }} pesquisador(es)
                </span>
                <i class="bi bi-arrow-right text-primary" />
              </span>
            </RouterLink>
          </BCol>
        </BRow>
      </BContainer>
    </section>

    <!-- ------------------- publicações recentes ------------------- -->
    <section class="i2a-secao-escura py-5">
      <BContainer class="py-lg-4">
        <div class="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
          <div>
            <p class="i2a-eyebrow i2a-eyebrow--traco mb-2">Produção</p>
            <h2 class="h4 fw-bold mb-0">Publicações recentes</h2>
          </div>
          <RouterLink :to="{ name: 'producoes' }" class="btn btn-sm btn-outline-light">
            Ver todas <i class="bi bi-arrow-right ms-1" />
          </RouterLink>
        </div>

        <CarregandoBloco v-if="carregando" />

        <EstadoVazio
          v-else-if="!publicacoes.length"
          escuro
          icone="bi-journal-text"
          titulo="Nenhuma publicação cadastrada ainda"
          descricao="Artigos, capítulos e softwares do grupo aparecem aqui."
        />

        <BRow v-else class="g-3">
          <BCol v-for="pub in publicacoes" :key="pub.id" md="6">
            <div class="i2a-card i2a-card--estatico h-100 p-4">
              <span class="i2a-selo i2a-selo--vidro mb-3">{{ pub.ano ?? 's/d' }}</span>
              <p class="fw-semibold mb-2">{{ pub.titulo }}</p>
              <p class="small text-body-secondary mb-1">
                {{ pub.autores?.map((a) => a.nome).join('; ') }}
              </p>
              <p class="small text-body-secondary mb-0">{{ pub.veiculo }}</p>
            </div>
          </BCol>
        </BRow>
      </BContainer>
    </section>

    <!-- ------------------------- chamadas ------------------------- -->
    <section class="py-5">
      <BContainer class="py-lg-4">
        <BRow class="g-4">
          <BCol md="5">
            <div class="i2a-painel p-4 p-lg-5 h-100 d-flex flex-column">
              <span class="i2a-icone i2a-icone--violeta mb-3"><i class="bi bi-easel" /></span>
              <p class="i2a-eyebrow mb-2">Formação</p>
              <h3 class="h5 fw-bold mb-2">Cursos abertos à comunidade</h3>
              <p class="text-body-secondary small flex-grow-1 mb-4">
                {{
                  cursosAbertos.length
                    ? `${cursosAbertos.length} curso(s) com inscrições abertas agora.`
                    : 'Nenhuma inscrição aberta no momento. Acompanhe as próximas ofertas.'
                }}
              </p>
              <div>
                <RouterLink :to="{ name: 'cursos' }" class="btn btn-outline-primary">
                  Ver cursos
                </RouterLink>
              </div>
            </div>
          </BCol>

          <BCol md="7">
            <div class="i2a-cta p-4 p-lg-5 h-100 d-flex flex-column">
              <span class="i2a-icone i2a-icone--vidro mb-3"><i class="bi bi-rocket-takeoff" /></span>
              <p class="i2a-eyebrow mb-2">Oportunidades</p>
              <h3 class="h4 fw-bold mb-2">Faça iniciação científica no I2A</h3>
              <p class="text-body-secondary flex-grow-1 mb-4" style="max-width: 48ch">
                Bolsas de PIBIC e PIBIT, voluntariado e projetos de extensão abertos a
                estudantes do IFMA. Não é preciso experiência prévia.
              </p>
              <div>
                <RouterLink :to="{ name: 'participe' }" class="btn btn-light fw-semibold px-4">
                  Como participar <i class="bi bi-arrow-right ms-1" />
                </RouterLink>
              </div>
            </div>
          </BCol>
        </BRow>
      </BContainer>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { BContainer, BRow, BCol } from 'bootstrap-vue-next';

import SecaoTitulo from '@/components/comum/SecaoTitulo.vue';
import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { APP } from '@/config';
import { estatisticas, linhas, cursos, producoes } from '@/services/publicoService';

const carregando = ref(true);
const dados = ref(null);
const linhasLista = ref([]);
const cursosAbertos = ref([]);
const publicacoes = ref([]);

const numeros = computed(() => [
  { rotulo: 'Pesquisadores', valor: dados.value?.totalPesquisadores ?? 0, icone: 'bi-people' },
  { rotulo: 'Projetos', valor: dados.value?.totalProjetos ?? 0, icone: 'bi-kanban' },
  { rotulo: 'Publicações', valor: dados.value?.totalProducoes ?? 0, icone: 'bi-journal-text' },
  { rotulo: 'Cursos ofertados', valor: dados.value?.totalCursos ?? 0, icone: 'bi-easel' }
]);

/** Ícone e cor de cada linha de pesquisa, em rodízio, para dar variedade aos cartões. */
const CORES = [
  { classe: '', icone: 'bi-cpu' },
  { classe: 'i2a-icone--ciano', icone: 'bi-heart-pulse' },
  { classe: 'i2a-icone--violeta', icone: 'bi-eye' },
  { classe: 'i2a-icone--ambar', icone: 'bi-chat-square-text' },
  { classe: 'i2a-icone--verde', icone: 'bi-graph-up' },
  { classe: 'i2a-icone--rosa', icone: 'bi-lightbulb' }
];
const corDaLinha = (i) => CORES[i % CORES.length];

onMounted(async () => {
  try {
    const [est, ln, cs, pb] = await Promise.all([
      estatisticas(),
      linhas(),
      cursos({ abertos: '1', limit: 3 }),
      producoes({ limit: 4 })
    ]);
    dados.value = est;
    linhasLista.value = ln.data;
    cursosAbertos.value = cs.data;
    publicacoes.value = pb.data;
  } finally {
    carregando.value = false;
  }
});
</script>
