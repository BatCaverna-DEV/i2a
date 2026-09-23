<template>
  <div>
    <BContainer v-if="carregando" class="py-5"><CarregandoBloco /></BContainer>

    <template v-else-if="dados">
      <CabecalhoPagina :voltar="{ name: 'participe' }" voltar-rotulo="Participe" :titulo="dados.titulo">
        <span class="i2a-selo mt-3" :class="dados.aberta ? 'i2a-selo--ciano' : 'i2a-selo--vidro'">
          <i class="bi me-1" :class="dados.aberta ? 'bi-unlock' : 'bi-lock'" />
          {{ dados.aberta ? 'Inscrições abertas' : 'Inscrições encerradas' }}
        </span>
      </CabecalhoPagina>

      <BContainer class="py-5">
        <BRow class="g-4">
          <BCol lg="7">
            <div class="i2a-painel p-4 p-lg-5 mb-4">
              <p class="i2a-eyebrow i2a-eyebrow--traco mb-3">Sobre a vaga</p>
              <!-- white-space: pre-line mantém os parágrafos digitados no painel -->
              <p class="fs-6 text-body-secondary mb-0" style="white-space: pre-line">
                {{ dados.descricao || 'Sem descrição cadastrada.' }}
              </p>
            </div>

            <div class="i2a-surface p-4">
              <ul class="list-unstyled d-grid gap-4 mb-0 small">
                <li class="d-flex gap-3">
                  <span class="i2a-icone"><i class="bi bi-kanban" /></span>
                  <div>
                    <p class="i2a-eyebrow mb-1">Projeto</p>
                    <RouterLink v-if="dados.projeto" :to="{ name: 'projeto', params: { id: dados.projeto.id } }">
                      {{ dados.projeto.titulo }}
                    </RouterLink>
                  </div>
                </li>
                <li class="d-flex gap-3">
                  <span class="i2a-icone i2a-icone--violeta"><i class="bi bi-person-badge" /></span>
                  <div>
                    <p class="i2a-eyebrow mb-1">Responsável</p>
                    {{ dados.projeto?.coordenador?.nome ?? '—' }}
                  </div>
                </li>
                <li class="d-flex gap-3">
                  <span class="i2a-icone i2a-icone--ciano"><i class="bi bi-calendar-event" /></span>
                  <div>
                    <p class="i2a-eyebrow mb-1">Inscrições até</p>
                    {{ formatarData(dados.prazo) }}
                    <span class="d-block i2a-meta">
                      {{ dados.quantidade }} vaga{{ dados.quantidade > 1 ? 's' : '' }}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </BCol>

          <BCol lg="5">
            <div class="i2a-card p-4 p-lg-5">
              <p class="i2a-eyebrow mb-3">Candidatura</p>

              <EstadoVazio
                v-if="!dados.aberta"
                icone="bi-lock"
                titulo="O prazo desta vaga encerrou"
                descricao="Veja as outras vagas abertas na página Participe."
              />

              <div v-else-if="enviada" class="text-center py-3">
                <i class="bi bi-check-circle text-success display-5 d-block mb-3" />
                <h2 class="h5 fw-semibold">Candidatura enviada</h2>
                <p class="small text-body-secondary mb-0">
                  O pesquisador responsável vai entrar em contato pelo e-mail
                  <strong>{{ form.email }}</strong>.
                </p>
              </div>

              <BForm v-else novalidate @submit.prevent="enviar">
                <BAlert :model-value="Boolean(erro)" variant="danger" class="py-2 small">{{ erro }}</BAlert>

                <BFormGroup label="Nome completo" label-for="nome" class="mb-3">
                  <BFormInput id="nome" v-model="form.nome" autocomplete="name" maxlength="100" required />
                </BFormGroup>

                <BFormGroup label="Matrícula" label-for="matricula" class="mb-3">
                  <BFormInput id="matricula" v-model="form.matricula" maxlength="20" required />
                </BFormGroup>

                <BFormGroup
                  label="E-mail acadêmico"
                  label-for="email"
                  description="Use o e-mail institucional (@acad.ifma.edu.br)."
                  class="mb-4"
                >
                  <BFormInput
                    id="email"
                    v-model="form.email"
                    type="email"
                    autocomplete="email"
                    maxlength="150"
                    placeholder="nome@acad.ifma.edu.br"
                    required
                  />
                </BFormGroup>

                <BButton type="submit" variant="primary" class="w-100" :disabled="enviando">
                  <span v-if="enviando" class="spinner-border spinner-border-sm me-2" />
                  Enviar candidatura
                </BButton>
              </BForm>
            </div>
          </BCol>
        </BRow>
      </BContainer>
    </template>

    <BContainer v-else class="py-5">
      <EstadoVazio icone="bi-exclamation-circle" titulo="Vaga não encontrada" descricao="" />
    </BContainer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import {
  BContainer,
  BRow,
  BCol,
  BForm,
  BFormGroup,
  BFormInput,
  BButton,
  BAlert
} from 'bootstrap-vue-next';

import CabecalhoPagina from '@/components/comum/CabecalhoPagina.vue';
import CarregandoBloco from '@/components/comum/CarregandoBloco.vue';
import EstadoVazio from '@/components/comum/EstadoVazio.vue';
import { vaga, candidatar } from '@/services/publicoService';
import { mensagemDeErro } from '@/services/http';
import { formatarData } from '@/utils/formatadores';

const props = defineProps({ id: { type: String, required: true } });

const dados = ref(null);
const carregando = ref(true);

const form = reactive({ nome: '', matricula: '', email: '' });
const enviando = ref(false);
const enviada = ref(false);
const erro = ref('');

/** Checagem rápida no navegador; a regra de verdade (domínio do e-mail etc.) é da API. */
function validar() {
  if (form.nome.trim().length < 3) return 'Informe o nome completo.';
  if (form.matricula.trim().length < 3) return 'Informe a matrícula.';
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Informe um e-mail válido.';
  return '';
}

async function enviar() {
  erro.value = validar();
  if (erro.value) return;

  enviando.value = true;
  try {
    await candidatar(props.id, {
      nome: form.nome.trim(),
      matricula: form.matricula.trim(),
      email: form.email.trim()
    });
    enviada.value = true;
  } catch (e) {
    erro.value = mensagemDeErro(e, 'Não foi possível enviar a candidatura.');
  } finally {
    enviando.value = false;
  }
}

onMounted(async () => {
  try {
    dados.value = await vaga(props.id);
  } catch {
    dados.value = null;
  } finally {
    carregando.value = false;
  }
});
</script>
