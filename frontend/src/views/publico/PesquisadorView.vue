<template>
  <div>
    <BContainer v-if="carregando" class="py-5"><CarregandoBloco /></BContainer>

    <template v-else-if="dados">
      <CabecalhoPagina :voltar="{ name: 'pesquisadores' }" voltar-rotulo="Equipe">
        <div class="d-flex flex-column flex-md-row align-items-md-center gap-4">
          <span class="i2a-avatar i2a-avatar--grande">{{ iniciais(dados.nome) }}</span>
          <div style="min-width: 0">
            <p class="i2a-eyebrow mb-1">
              {{ dados.papel ?? (dados.tipo === 2 ? 'Aluno' : 'Pesquisador') }}
            </p>
            <h1 class="display-6 fw-bold mb-2">{{ dados.nome }}</h1>
            <span class="i2a-selo i2a-selo--vidro">
              <i class="bi bi-diagram-3 me-1" />{{ dados.linha?.descricao ?? 'Sem linha definida' }}
            </span>
          </div>
        </div>

        <p v-if="dados.resumo" class="text-body-secondary mt-4 mb-0" style="max-width: 70ch">
          {{ dados.resumo }}
        </p>

        <div class="d-flex flex-wrap gap-2 mt-4">
          <a :href="`mailto:${dados.email}`" class="btn btn-sm btn-outline-light">
            <i class="bi bi-envelope me-1" />{{ dados.email }}
          </a>
          <a
            v-if="dados.lattes"
            :href="dados.lattes"
            target="_blank"
            rel="noopener"
            class="btn btn-sm btn-ciano"
          >
            <i class="bi bi-box-arrow-up-right me-1" />Currículo Lattes
          </a>
        </div>
      </CabecalhoPagina>

      <BContainer class="py-5">
        <BRow class="g-4">
          <BCol lg="7">
            <div class="i2a-painel p-4 p-lg-5">
              <SecaoTitulo eyebrow="Pesquisa" titulo="Projetos" tag="h2" />
              <EstadoVazio
                v-if="!dados.projetos?.length"
                icone="bi-kanban"
                titulo="Nenhum projeto vinculado"
                descricao=""
              />
              <ul v-else class="list-unstyled d-grid gap-2 mb-5">
                <li v-for="p in dados.projetos" :key="p.id" class="border-bottom pb-2">
                  <RouterLink
                    :to="{ name: 'projeto', params: { id: p.id } }"
                    class="text-decoration-none link-dark fw-semibold"
                  >
                    {{ p.titulo }}
                  </RouterLink>
                  <span class="i2a-meta ms-2">
                    {{ STATUS_PROJETO[p.status]?.rotulo }}<template v-if="p.ano"> · {{ p.ano }}</template>
                  </span>
                </li>
              </ul>

              <SecaoTitulo eyebrow="Produção" titulo="Publicações" tag="h2" />
              <EstadoVazio
                v-if="!dados.producoes?.length"
                icone="bi-journal-text"
                titulo="Nenhuma publicação cadastrada"
                descricao=""
              />
              <ul v-else class="list-unstyled d-grid gap-3 mb-0">
                <li v-for="pr in dados.producoes" :key="pr.id" class="border-bottom pb-3">
                  <p class="fw-semibold mb-1">{{ pr.titulo }}</p>
                  <p class="i2a-meta mb-0">
                    {{ pr.veiculo || '—' }} · {{ pr.ano ?? 's/d' }} ·
                    {{ TIPO_PRODUCAO[pr.tipo] ?? '' }}
                    <a
                      v-if="pr.doi"
                      :href="`https://doi.org/${pr.doi}`"
                      target="_blank"
                      rel="noopener"
                      class="ms-2"
                    >DOI</a>
                  </p>
                </li>
              </ul>
            </div>
          </BCol>

          <BCol lg="5">
            <div class="i2a-surface p-4">
              <p class="i2a-eyebrow mb-3">Formação</p>
              <EstadoVazio
                v-if="!dados.titulacoes?.length"
                icone="bi-mortarboard"
                titulo="Sem titulações cadastradas"
                descricao=""
              />
              <ul v-else class="list-unstyled d-grid gap-3 mb-0">
                <li v-for="(t, i) in dados.titulacoes" :key="i" class="d-flex gap-3">
                  <span class="i2a-icone i2a-icone--ambar"><i class="bi bi-mortarboard" /></span>
                  <div>
                    <p class="small fw-semibold mb-0">{{ t.titulo }}</p>
                    <p class="i2a-meta mb-0">{{ t.instituicao }} · {{ t.ano ?? '—' }}</p>
                  </div>
                </li>
              </ul>

              <template v-if="dados.cursos?.length">
                <hr class="i2a-rule my-4" />
                <p class="i2a-eyebrow mb-3">Cursos ministrados</p>
                <ul class="list-unstyled d-grid gap-2 mb-0">
                  <li v-for="c in dados.cursos" :key="c.id" class="small">
                    <RouterLink
                      :to="{ name: 'curso', params: { id: c.id } }"
                      class="link-dark text-decoration-none"
                    >
                      <i class="bi bi-easel me-2 text-primary" />{{ c.titulo }}
                    </RouterLink>
                  </li>
                </ul>
              </template>
            </div>
          </BCol>
        </BRow>
      </BContainer>
    </template>

    <BContainer v-else class="py-5">
      <EstadoVazio icone="bi-exclamation-circle" titulo="Pesquisador não encontrado" descricao="" />
    </BContainer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { BContainer, BRow, BCol } from 'bootstrap-vue-next';

import CabecalhoPagina from '@/components/comum/CabecalhoPagina.vue';
import SecaoTitulo from '@/components/comum/SecaoTitulo.vue';
import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { pesquisador } from '@/services/publicoService';
import { STATUS_PROJETO, TIPO_PRODUCAO, iniciais } from '@/utils/formatadores';

const props = defineProps({ id: { type: String, required: true } });

const dados = ref(null);
const carregando = ref(true);

onMounted(async () => {
  try {
    dados.value = await pesquisador(props.id);
  } catch {
    dados.value = null;
  } finally {
    carregando.value = false;
  }
});
</script>
