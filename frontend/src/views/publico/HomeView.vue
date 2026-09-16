<template>
  <div>
    <!-- ------------------------- abertura ------------------------- -->
    <section class="pt-5 pb-5">
      <BContainer class="py-lg-4">
        <BRow>
          <BCol lg="9" xl="8">
            <p class="i2a-eyebrow mb-3">{{ APP.instituicao }} · {{ APP.campus }}</p>
            <h1 class="display-5 fw-bold mb-3" style="max-width: 20ch">
              Inteligência Artificial e Aplicações
            </h1>
            <p class="fs-5 text-body-secondary mb-4" style="max-width: 62ch">
              O I2A reúne professores e estudantes do IFMA em torno de aprendizagem de máquina
              e suas aplicações — da saúde ao sensoriamento remoto, do ensino à gestão pública.
            </p>
            <div class="d-flex flex-wrap gap-2">
              <RouterLink :to="{ name: 'projetos' }" class="btn btn-primary">
                Ver projetos
              </RouterLink>
              <RouterLink :to="{ name: 'participe' }" class="btn btn-outline-secondary">
                Participe do grupo
              </RouterLink>
            </div>
          </BCol>
        </BRow>
      </BContainer>
    </section>

    <!-- ------------------------- números -------------------------- -->
    <section class="border-top border-bottom">
      <BContainer>
        <BRow class="py-4 text-center text-md-start">
          <BCol
            v-for="(n, i) in numeros"
            :key="n.rotulo"
            cols="6"
            md="3"
            class="py-3"
            :class="{ 'border-start': i > 0 }"
          >
            <p class="i2a-stat mb-1">{{ n.valor }}</p>
            <p class="i2a-meta mb-0">{{ n.rotulo }}</p>
          </BCol>
        </BRow>
      </BContainer>
    </section>

    <!-- --------------------- linhas de pesquisa ------------------- -->
    <section class="py-5">
      <BContainer class="py-lg-3">
        <SecaoTitulo
          eyebrow="O que pesquisamos"
          titulo="Linhas de pesquisa"
          descricao="Cada linha reúne projetos, orientações e publicações em torno de um eixo temático."
        />

        <CarregandoBloco v-if="carregando" />

        <BRow v-else class="g-3">
          <BCol v-for="linha in linhasLista" :key="linha.id" md="6" lg="4">
            <RouterLink
              :to="{ name: 'pesquisadores', query: { linha: linha.id } }"
              class="i2a-card d-block h-100 p-4 text-decoration-none text-body"
            >
              <h3 class="h6 fw-semibold mb-2">{{ linha.descricao }}</h3>
              <p class="i2a-meta mb-0">
                {{ linha.total_pesquisadores ?? 0 }} pesquisador(es)
              </p>
            </RouterLink>
          </BCol>
        </BRow>
      </BContainer>
    </section>

    <!-- ------------------- publicações recentes ------------------- -->
    <section class="pb-5">
      <BContainer class="pb-lg-3">
        <SecaoTitulo eyebrow="Produção" titulo="Publicações recentes">
          <template #acao>
            <RouterLink :to="{ name: 'producoes' }" class="btn btn-sm btn-outline-secondary">
              Ver todas
            </RouterLink>
          </template>
        </SecaoTitulo>

        <CarregandoBloco v-if="carregando" />

        <ul v-else class="list-unstyled d-grid gap-3 mb-0">
          <li v-for="pub in publicacoes" :key="pub.id" class="border-bottom pb-3">
            <p class="fw-semibold mb-1">{{ pub.titulo }}</p>
            <p class="i2a-meta mb-0">
              {{ pub.autores?.map((a) => a.nome).join('; ') }} ·
              {{ pub.veiculo }} · {{ pub.ano }}
            </p>
          </li>
        </ul>
      </BContainer>
    </section>

    <!-- ------------------------- chamadas ------------------------- -->
    <section class="pb-5">
      <BContainer class="pb-lg-4">
        <BRow class="g-3">
          <BCol md="6">
            <div class="i2a-surface p-4 h-100 d-flex flex-column">
              <p class="i2a-eyebrow mb-2">Formação</p>
              <h3 class="h5 fw-semibold mb-2">Cursos abertos à comunidade</h3>
              <p class="text-body-secondary small flex-grow-1">
                {{
                  cursosAbertos.length
                    ? `${cursosAbertos.length} curso(s) com inscrições abertas agora.`
                    : 'Nenhuma inscrição aberta no momento. Acompanhe as próximas ofertas.'
                }}
              </p>
              <div>
                <RouterLink :to="{ name: 'cursos' }" class="btn btn-sm btn-outline-secondary">
                  Ver cursos
                </RouterLink>
              </div>
            </div>
          </BCol>

          <BCol md="6">
            <div class="i2a-surface p-4 h-100 d-flex flex-column">
              <p class="i2a-eyebrow mb-2">Oportunidades</p>
              <h3 class="h5 fw-semibold mb-2">Faça iniciação científica no I2A</h3>
              <p class="text-body-secondary small flex-grow-1">
                Bolsas de PIBIC e PIBIT, voluntariado e projetos de extensão abertos a
                estudantes do IFMA.
              </p>
              <div>
                <RouterLink :to="{ name: 'participe' }" class="btn btn-sm btn-primary">
                  Como participar
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
import { APP } from '@/config';
import { estatisticas, linhas, cursos, producoes } from '@/services/publicoService';

const carregando = ref(true);
const dados = ref(null);
const linhasLista = ref([]);
const cursosAbertos = ref([]);
const publicacoes = ref([]);

const numeros = computed(() => [
  { rotulo: 'Pesquisadores', valor: dados.value?.totalPesquisadores ?? 0 },
  { rotulo: 'Projetos', valor: dados.value?.totalProjetos ?? 0 },
  { rotulo: 'Publicações', valor: dados.value?.totalProducoes ?? 0 },
  { rotulo: 'Cursos ofertados', valor: dados.value?.totalCursos ?? 0 }
]);

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
