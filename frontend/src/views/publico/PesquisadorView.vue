<template>
  <BContainer class="py-5">
    <CarregandoBloco v-if="carregando" />

    <div v-else-if="dados">
      <RouterLink :to="{ name: 'pesquisadores' }" class="i2a-meta text-decoration-none">
        <i class="bi bi-arrow-left me-1" />Equipe
      </RouterLink>

      <BRow class="g-5 mt-0">
        <BCol lg="7">
          <p v-if="dados.papel" class="i2a-eyebrow mb-2">{{ dados.papel }}</p>
          <h1 class="h2 fw-bold mb-2">{{ dados.nome }}</h1>
          <p class="i2a-meta mb-3">
            {{ dados.linha?.descricao ?? 'Sem linha definida' }}
          </p>
          <p v-if="dados.resumo" class="text-body-secondary">{{ dados.resumo }}</p>

          <div class="d-flex flex-wrap gap-3 i2a-meta">
            <a :href="`mailto:${dados.email}`" class="link-dark text-decoration-none">
              <i class="bi bi-envelope me-1" />{{ dados.email }}
            </a>
            <a
              v-if="dados.lattes"
              :href="dados.lattes"
              target="_blank"
              rel="noopener"
              class="link-dark text-decoration-none"
            >
              <i class="bi bi-box-arrow-up-right me-1" />Currículo Lattes
            </a>
          </div>

          <hr class="i2a-rule my-4" />

          <SecaoTitulo titulo="Projetos" tag="h2" />
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

          <SecaoTitulo titulo="Publicações" tag="h2" />
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
              <li v-for="(t, i) in dados.titulacoes" :key="i">
                <p class="small fw-semibold mb-0">{{ t.titulo }}</p>
                <p class="i2a-meta mb-0">{{ t.instituicao }} · {{ t.ano ?? '—' }}</p>
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
                    {{ c.titulo }}
                  </RouterLink>
                </li>
              </ul>
            </template>
          </div>
        </BCol>
      </BRow>
    </div>

    <EstadoVazio v-else icone="bi-exclamation-circle" titulo="Pesquisador não encontrado" descricao="" />
  </BContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { BContainer, BRow, BCol } from 'bootstrap-vue-next';

import SecaoTitulo from '@/components/comum/SecaoTitulo.vue';
import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { pesquisador } from '@/services/publicoService';
import { STATUS_PROJETO, TIPO_PRODUCAO } from '@/utils/formatadores';

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
