<template>
  <div class="min-vh-100 d-flex flex-column">
    <BarraDemo />

    <div class="flex-grow-1 d-flex align-items-center py-5">
      <BContainer>
        <BRow class="justify-content-center">
          <BCol md="7" lg="4">
            <div class="text-center mb-4">
              <p class="fw-bold h5 mb-1">{{ APP.sigla }}</p>
              <p class="i2a-meta mb-0">Área administrativa</p>
            </div>

            <div class="i2a-card p-4">
              <BAlert :model-value="Boolean(auth.erro)" variant="danger" class="py-2 small">
                {{ auth.erro }}
              </BAlert>

              <!-- etapa 1: usuário e senha -->
              <BForm v-if="auth.etapa === 'senha'" @submit.prevent="entrar">
                <BFormGroup label="Usuário" label-for="username" class="mb-3">
                  <BFormInput
                    id="username"
                    v-model.trim="username"
                    autocomplete="username"
                    required
                    autofocus
                  />
                </BFormGroup>

                <BFormGroup label="Senha" label-for="senha" class="mb-4">
                  <BFormInput
                    id="senha"
                    v-model="senha"
                    type="password"
                    autocomplete="current-password"
                    required
                  />
                </BFormGroup>

                <BButton type="submit" variant="primary" class="w-100" :disabled="auth.carregando">
                  <BSpinner v-if="auth.carregando" small class="me-2" />Entrar
                </BButton>
              </BForm>

              <!-- etapa 2: código do Google Authenticator -->
              <BForm v-else @submit.prevent="confirmar">
                <div v-if="auth.etapa === 'cadastrar-2fa'" class="text-center mb-3">
                  <p class="small text-body-secondary">
                    Escaneie o QR Code com o <strong>Google Authenticator</strong> e digite o
                    código gerado.
                  </p>
                  <img
                    v-if="auth.qrCode"
                    :src="auth.qrCode"
                    alt="QR Code do Google Authenticator"
                    class="img-fluid mb-2"
                  />
                  <p v-if="auth.segredo" class="i2a-meta mb-0">
                    Código manual: <code class="user-select-all">{{ auth.segredo }}</code>
                  </p>
                </div>

                <p v-else class="small text-body-secondary text-center">
                  Digite o código de 6 dígitos do Google Authenticator.
                </p>

                <BFormGroup label="Código de verificação" label-for="codigo" class="mb-4">
                  <BFormInput
                    id="codigo"
                    v-model.trim="codigo"
                    inputmode="numeric"
                    maxlength="6"
                    placeholder="000000"
                    class="text-center fs-4 i2a-codigo"
                    autocomplete="one-time-code"
                    required
                    autofocus
                  />
                </BFormGroup>

                <BButton
                  type="submit"
                  variant="primary"
                  class="w-100 mb-2"
                  :disabled="auth.carregando || codigo.length !== 6"
                >
                  <BSpinner v-if="auth.carregando" small class="me-2" />Verificar
                </BButton>

                <BButton variant="link" size="sm" class="w-100 text-body-secondary" @click="voltar">
                  Voltar
                </BButton>
              </BForm>
            </div>

            <p class="text-center i2a-meta mt-3 mb-0">
              <RouterLink :to="{ name: 'home' }" class="text-decoration-none">
                ← Voltar ao site
              </RouterLink>
            </p>
          </BCol>
        </BRow>
      </BContainer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  BContainer,
  BRow,
  BCol,
  BForm,
  BFormGroup,
  BFormInput,
  BButton,
  BAlert,
  BSpinner
} from 'bootstrap-vue-next';

import BarraDemo from '@/components/comum/BarraDemo.vue';
import { useAuthStore } from '@/stores/auth';
import { APP, USANDO_MOCKS } from '@/config';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

// no modo demonstração os campos já vêm preenchidos, para entrar em dois cliques
const username = ref(USANDO_MOCKS ? 'admin' : '');
const senha = ref(USANDO_MOCKS ? 'demonstracao' : '');
const codigo = ref('');

async function entrar() {
  try {
    await auth.entrar(username.value, senha.value);
    if (USANDO_MOCKS) codigo.value = '123456';
  } catch {
    /* a mensagem já está em auth.erro */
  }
}

async function confirmar() {
  try {
    await auth.confirmarCodigo(codigo.value);
    router.push(route.query.redirect ?? { name: 'admin-dashboard' });
  } catch {
    codigo.value = '';
  }
}

function voltar() {
  auth.sair();
  senha.value = USANDO_MOCKS ? 'demonstracao' : '';
  codigo.value = '';
}
</script>

<style scoped>
.i2a-codigo {
  letter-spacing: 0.5rem;
}
</style>
