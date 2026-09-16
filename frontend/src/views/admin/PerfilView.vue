<template>
  <section>
    <PageHeader titulo="Meu perfil" subtitulo="Dados da conta, senha e segundo fator" />

    <BRow class="g-3">
      <BCol lg="5">
        <BCard title="Conta">
          <dl class="row mb-0 small">
            <dt class="col-5">Usuário</dt>
            <dd class="col-7">{{ auth.usuario?.username }}</dd>

            <dt class="col-5">Categoria</dt>
            <dd class="col-7">{{ CATEGORIA_USUARIO[auth.usuario?.categoria] ?? '—' }}</dd>

            <dt class="col-5">Pesquisador</dt>
            <dd class="col-7">{{ auth.usuario?.pesquisador?.nome ?? '—' }}</dd>

            <dt class="col-5">Google Authenticator</dt>
            <dd class="col-7">
              <BBadge :variant="auth.usuario?.totp_ativo ? 'success' : 'warning'">
                {{ auth.usuario?.totp_ativo ? 'Vinculado' : 'Pendente' }}
              </BBadge>
            </dd>
          </dl>

          <hr />

          <BButton size="sm" variant="outline-danger" @click="reiniciar">
            <i class="bi bi-phone me-1" />Vincular outro aparelho
          </BButton>
          <p class="small text-body-secondary mt-2 mb-0">
            Isso apaga o segundo fator atual. No próximo login um novo QR Code será exibido.
          </p>
        </BCard>
      </BCol>

      <BCol lg="7">
        <BCard title="Trocar senha">
          <BAlert :model-value="Boolean(erro)" variant="danger" class="py-2 small">{{ erro }}</BAlert>
          <BAlert :model-value="Boolean(sucesso)" variant="success" class="py-2 small">
            {{ sucesso }}
          </BAlert>

          <BForm @submit.prevent="salvar">
            <BFormGroup label="Senha atual" label-for="atual" class="mb-3">
              <BFormInput id="atual" v-model="senhaAtual" type="password" required />
            </BFormGroup>

            <BFormGroup label="Nova senha" label-for="nova" class="mb-3">
              <BFormInput id="nova" v-model="novaSenha" type="password" minlength="8" required />
            </BFormGroup>

            <BFormGroup label="Confirmar nova senha" label-for="conf" class="mb-3">
              <BFormInput id="conf" v-model="confirmacao" type="password" minlength="8" required />
            </BFormGroup>

            <BButton type="submit" variant="primary" :disabled="salvando">Salvar</BButton>
          </BForm>
        </BCard>
      </BCol>
    </BRow>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  BRow,
  BCol,
  BCard,
  BForm,
  BFormGroup,
  BFormInput,
  BButton,
  BAlert,
  BBadge
} from 'bootstrap-vue-next';

import PageHeader from '@/components/comum/PageHeader.vue';
import * as authService from '@/services/authService';
import { mensagemDeErro } from '@/services/http';
import { useAuthStore } from '@/stores/auth';
import { CATEGORIA_USUARIO } from '@/utils/formatadores';

const auth = useAuthStore();
const router = useRouter();

const senhaAtual = ref('');
const novaSenha = ref('');
const confirmacao = ref('');
const salvando = ref(false);
const erro = ref('');
const sucesso = ref('');

async function salvar() {
  erro.value = '';
  sucesso.value = '';
  salvando.value = true;
  try {
    await authService.trocarSenha(senhaAtual.value, novaSenha.value, confirmacao.value);
    sucesso.value = 'Senha alterada com sucesso.';
    senhaAtual.value = novaSenha.value = confirmacao.value = '';
  } catch (e) {
    erro.value = mensagemDeErro(e);
  } finally {
    salvando.value = false;
  }
}

async function reiniciar() {
  if (!window.confirm('Remover o vínculo atual do Google Authenticator?')) return;
  await authService.reiniciar2fa();
  auth.sair();
  router.push({ name: 'admin-login' });
}
</script>
