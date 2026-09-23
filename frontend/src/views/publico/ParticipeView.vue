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
            <article v-for="vaga in vagas" :key="vaga.id" class="i2a-card p-4">
              <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                <h3 class="h6 fw-semibold mb-0">{{ vaga.titulo }}</h3>
                <span class="i2a-selo">{{ vaga.nivel }}</span>
              </div>

              <p class="i2a-meta mb-3">{{ vaga.linha }}</p>
              <p class="small text-body-secondary mb-3">{{ vaga.requisitos }}</p>

              <div class="d-flex flex-wrap gap-3 i2a-meta align-items-center">
                <span><strong class="text-body">{{ vaga.vagas }}</strong> vaga(s)</span>
                <span>
                  {{ vaga.prazo ? `Inscrições até ${formatarData(vaga.prazo)}` : 'Fluxo contínuo' }}
                </span>
                <a :href="`mailto:${vaga.contato}`" class="link-dark text-decoration-none">
                  {{ vaga.contato }}
                </a>
              </div>
            </article>
          </div>
        </BCol>

        <BCol lg="5">
          <div class="i2a-surface p-4 mb-3">
            <p class="i2a-eyebrow mb-3">Como se candidatar</p>
            <ol class="small text-body-secondary d-grid gap-2 ps-3 mb-0">
              <li>
                Escolha uma
                <RouterLink :to="{ name: 'projetos' }">linha ou projeto</RouterLink>
                que tenha a ver com o que você quer estudar.
              </li>
              <li>
                Escreva para o pesquisador responsável apresentando-se: período do curso,
                disciplinas cursadas e o que te interessa no tema.
              </li>
              <li>Anexe seu histórico escolar e, se tiver, um link para seus projetos.</li>
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
import { oportunidades } from '@/services/publicoService';
import { formatarData } from '@/utils/formatadores';

const vagas = ref([]);
const carregando = ref(true);

onMounted(async () => {
  try {
    const { data } = await oportunidades();
    vagas.value = data;
  } catch {
    // a rota /publico/oportunidades ainda não existe no backend
    vagas.value = [];
  } finally {
    carregando.value = false;
  }
});
</script>
