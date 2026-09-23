<template>
  <div>
    <CabecalhoPagina
      eyebrow="Participe"
      titulo="Oportunidades no grupo"
      descricao="O I2A recebe estudantes de graduação em iniciação científica, iniciação tecnológica, voluntariado e projetos de extensão. Não é preciso experiência prévia em pesquisa — o que pesa é interesse e constância."
    />

    <BContainer class="py-5">
      <BRow class="g-5">
        <BCol lg="7">
          <SecaoTitulo titulo="Vagas abertas" tag="h2" />

          <CarregandoBloco v-if="carregando" />

          <EstadoVazio
            v-else-if="!vagas.length"
            icone="bi-clipboard-check"
            titulo="Nenhuma vaga aberta no momento"
            descricao="Escreva para o grupo mesmo assim — surgem oportunidades ao longo do ano."
          />

          <div v-else class="d-grid gap-3">
            <article v-for="v in vagas" :key="v.id" class="i2a-card p-4">
              <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                <h3 class="h6 fw-semibold mb-0">
                  <RouterLink :to="{ name: 'vaga', params: { id: v.id } }" class="link-dark text-decoration-none">
                    {{ v.titulo }}
                  </RouterLink>
                </h3>
                <span class="i2a-selo">{{ v.quantidade }} vaga{{ v.quantidade > 1 ? 's' : '' }}</span>
              </div>

              <p class="i2a-meta mb-3">
                {{ v.projeto?.titulo }}
                <template v-if="v.projeto?.coordenador"> · {{ v.projeto.coordenador.nome }}</template>
              </p>
              <p v-if="v.descricao" class="small text-body-secondary mb-3 i2a-resumo-vaga">
                {{ v.descricao }}
              </p>

              <div class="d-flex flex-wrap gap-3 i2a-meta align-items-center justify-content-between">
                <span><i class="bi bi-calendar-event me-1" />Inscrições até {{ formatarData(v.prazo) }}</span>
                <RouterLink :to="{ name: 'vaga', params: { id: v.id } }" class="btn btn-sm btn-primary">
                  Candidatar-se<i class="bi bi-arrow-right ms-1" />
                </RouterLink>
              </div>
            </article>
          </div>
        </BCol>

        <BCol lg="5">
          <div class="i2a-surface p-4 mb-3">
            <p class="i2a-eyebrow mb-3">Como se candidatar</p>
            <ol class="small text-body-secondary d-grid gap-2 ps-3 mb-0">
              <li>
                Escolha uma vaga ao lado — conheça antes o
                <RouterLink :to="{ name: 'projetos' }">projeto</RouterLink>
                a que ela pertence.
              </li>
              <li>
                Clique em <strong>Candidatar-se</strong> e informe nome, matrícula e o seu
                e-mail acadêmico, dentro do prazo.
              </li>
              <li>O pesquisador responsável entra em contato pelo e-mail acadêmico.</li>
              <li>Combine uma conversa presencial ou on-line com o orientador.</li>
            </ol>
          </div>

          <div class="i2a-surface p-4">
            <p class="i2a-eyebrow mb-3">O que esperamos</p>
            <ul class="small text-body-secondary d-grid gap-2 mb-0 ps-3">
              <li>Disponibilidade mínima de 8 a 12 horas semanais.</li>
              <li>Participação nas reuniões semanais do grupo.</li>
              <li>Vontade de aprender a programar bem — e não só a usar bibliotecas.</li>
            </ul>
          </div>
        </BCol>
      </BRow>
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
import { vagas as listarVagas } from '@/services/publicoService';
import { formatarData } from '@/utils/formatadores';

const vagas = ref([]);
const carregando = ref(true);

onMounted(async () => {
  try {
    // a API só devolve vagas com prazo em aberto
    const { data } = await listarVagas({ limit: 50 });
    vagas.value = data;
  } catch {
    vagas.value = [];
  } finally {
    carregando.value = false;
  }
});
</script>

<style scoped>
/* prévia da descrição: três linhas, o texto inteiro fica na página da vaga */
.i2a-resumo-vaga {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
