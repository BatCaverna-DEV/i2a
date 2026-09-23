<template>
  <div>
    <BContainer v-if="carregando" class="py-5"><CarregandoBloco /></BContainer>

    <template v-else-if="dados">
      <CabecalhoPagina
        :voltar="{ name: 'projetos' }"
        voltar-rotulo="Projetos"
        :eyebrow="cabecalho"
        :titulo="dados.titulo"
      />

      <BContainer class="py-5">
        <BRow class="g-4">
          <BCol lg="8">
            <div class="i2a-painel p-4 p-lg-5 h-100">
              <p class="i2a-eyebrow i2a-eyebrow--traco mb-3">Resumo</p>
              <!-- white-space: pre-line mantém os parágrafos digitados no painel -->
              <p class="fs-6 text-body-secondary mb-0" style="white-space: pre-line">
                {{ dados.resumo || 'Sem resumo cadastrado.' }}
              </p>
            </div>
          </BCol>

          <BCol lg="4">
            <div class="i2a-surface p-4">
              <p class="i2a-eyebrow mb-3">Coordenação</p>
              <div class="d-flex align-items-center gap-3 mb-4">
                <span class="i2a-avatar">{{ iniciais(dados.coordenador?.nome) }}</span>
                <span class="fw-semibold small">{{ dados.coordenador?.nome ?? '—' }}</span>
              </div>

              <p class="i2a-eyebrow mb-3">Equipe</p>
              <EstadoVazio
                v-if="!dados.equipe?.length"
                icone="bi-people"
                titulo="Equipe não cadastrada"
                descricao=""
              />
              <ul v-else class="list-unstyled d-grid gap-2 mb-0 small">
                <li v-for="m in dados.equipe" :key="m.id">
                  <RouterLink
                    :to="{ name: 'pesquisador', params: { id: m.id } }"
                    class="link-dark text-decoration-none d-flex align-items-center gap-2"
                  >
                    <i class="bi bi-person-circle text-primary" />{{ m.nome }}
                  </RouterLink>
                </li>
              </ul>
            </div>
          </BCol>
        </BRow>
      </BContainer>
    </template>

    <BContainer v-else class="py-5">
      <EstadoVazio icone="bi-exclamation-circle" titulo="Projeto não encontrado" descricao="" />
    </BContainer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { BContainer, BRow, BCol } from 'bootstrap-vue-next';

import CabecalhoPagina from '@/components/comum/CabecalhoPagina.vue';
import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { projeto } from '@/services/publicoService';
import { STATUS_PROJETO, TIPO_PROJETO, iniciais } from '@/utils/formatadores';

const props = defineProps({ id: { type: String, required: true } });

const dados = ref(null);
const carregando = ref(true);

/** Linha acima do título: tipo · situação · ano de início. */
const cabecalho = computed(() => {
  if (!dados.value) return '';
  const partes = [TIPO_PROJETO[dados.value.tipo] ?? '—', STATUS_PROJETO[dados.value.status]?.rotulo];
  if (dados.value.ano) partes.push(`desde ${dados.value.ano}`);
  return partes.filter(Boolean).join(' · ');
});

onMounted(async () => {
  try {
    dados.value = await projeto(props.id);
  } catch {
    dados.value = null;
  } finally {
    carregando.value = false;
  }
});
</script>
