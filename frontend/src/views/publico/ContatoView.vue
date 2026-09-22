<template>
  <BContainer class="py-5">
    <BRow class="g-5">
      <BCol lg="6">
        <p class="i2a-eyebrow mb-3">Contato</p>
        <h1 class="h2 fw-bold mb-3">Fale com o grupo</h1>
        <p class="fs-6 text-body-secondary mb-5" style="max-width: 58ch">
          Dúvidas sobre os projetos, interesse em colaboração institucional ou vontade de
          participar da pesquisa — escreva, respondemos em alguns dias úteis.
        </p>

        <!--
          O envio ainda não está ligado: quando existir a rota de contato no
          backend (ou um serviço de e-mail), basta preencher `enviar()`.
        -->
        <BForm @submit.prevent="enviar">
          <BAlert :model-value="enviado" variant="success" class="py-2 small">
            Mensagem registrada. O envio será ativado junto com a API.
          </BAlert>

          <BRow class="g-3">
            <BCol md="6">
              <BFormGroup label="Nome" label-for="nome">
                <BFormInput id="nome" v-model.trim="form.nome" required />
              </BFormGroup>
            </BCol>
            <BCol md="6">
              <BFormGroup label="E-mail" label-for="email">
                <BFormInput id="email" v-model.trim="form.email" type="email" required />
              </BFormGroup>
            </BCol>
            <BCol cols="12">
              <BFormGroup label="Assunto" label-for="assunto">
                <BFormSelect id="assunto" v-model="form.assunto" :options="assuntos" />
              </BFormGroup>
            </BCol>
            <BCol cols="12">
              <BFormGroup label="Mensagem" label-for="mensagem">
                <BFormTextarea id="mensagem" v-model="form.mensagem" rows="5" required />
              </BFormGroup>
            </BCol>
          </BRow>

          <BButton type="submit" variant="primary" class="mt-4">Enviar mensagem</BButton>
        </BForm>
      </BCol>

      <BCol lg="5" class="offset-lg-1">
        <div class="i2a-surface p-4 mb-3">
          <p class="i2a-eyebrow mb-3">Endereço</p>
          <p class="small mb-1 fw-semibold">{{ APP.instituicao }}</p>
          <p class="small text-body-secondary mb-3">
            {{ APP.campus }}<br />
            Coelho Neto — Maranhão
          </p>

          <p class="i2a-eyebrow mb-2">E-mail</p>
          <p class="small mb-3">
            <a :href="`mailto:${APP.email}`" class="link-dark text-decoration-none">
              {{ APP.email }}
            </a>
          </p>

          <p class="i2a-eyebrow mb-2">Curso vinculado</p>
          <p class="small text-body-secondary mb-0">
            Análise e Desenvolvimento de Sistemas (ADS)
          </p>
        </div>

        <div class="i2a-surface p-4">
          <p class="i2a-eyebrow mb-2">Estudante do IFMA?</p>
          <p class="small text-body-secondary">
            Para iniciação científica, o caminho mais rápido é falar direto com o pesquisador
            da linha que te interessa.
          </p>
          <RouterLink :to="{ name: 'participe' }" class="btn btn-sm btn-outline-secondary">
            Ver oportunidades
          </RouterLink>
        </div>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup>
import { reactive, ref } from 'vue';
import {
  BContainer,
  BRow,
  BCol,
  BForm,
  BFormGroup,
  BFormInput,
  BFormSelect,
  BFormTextarea,
  BButton,
  BAlert
} from 'bootstrap-vue-next';

import { APP } from '@/config';

const assuntos = [
  { value: 'pesquisa', text: 'Interesse em pesquisa / iniciação científica' },
  { value: 'colaboracao', text: 'Colaboração institucional' },
  { value: 'cursos', text: 'Dúvida sobre cursos' },
  { value: 'imprensa', text: 'Imprensa' },
  { value: 'outro', text: 'Outro assunto' }
];

const form = reactive({ nome: '', email: '', assunto: 'pesquisa', mensagem: '' });
const enviado = ref(false);

function enviar() {
  // TODO: ligar em POST /api/publico/contato quando a rota existir.
  enviado.value = true;
}
</script>
