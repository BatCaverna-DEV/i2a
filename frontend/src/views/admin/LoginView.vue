<template>
  <div class="min-vh-100 d-flex align-items-center bg-body-tertiary py-5">
    <BContainer>
      <BRow class="justify-content-center">
        <BCol md="8" lg="5">
          <BCard class="shadow-sm">
            <div class="text-center mb-4">
              <i class="bi bi-cpu fs-1 text-primary" />
              <h1 class="h5 fw-bold mt-2 mb-1">Área administrativa</h1>
              <p class="small text-body-secondary mb-0">Grupo de Pesquisa I2A · IFMA</p>
            </div>

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
                  Escaneie o QR Code abaixo com o <strong>Google Authenticator</strong> e digite o
                  código gerado para concluir o primeiro acesso.
                </p>
                <img :src="auth.qrCode" alt="QR Code do Google Authenticator" class="img-fluid mb-2" />
                <p class="small text-body-secondary mb-0">
                  Não consegue escanear? Código manual:
                  <code class="user-select-all">{{ auth.segredo }}</code>
                </p>
              </div>

              <p v-else class="small text-body-secondary text-center">
                Digite o código de 6 dígitos exibido no Google Authenticator.
              </p>

              <BFormGroup label="Código de verificação" label-for="codigo" class="mb-4">
                <BFormInput
                  id="codigo"
                  v-model.trim="codigo"
                  inputmode="numeric"
                  maxlength="6"
                  placeholder="000000"
                  class="text-center fs-4 letter-spacing"
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

              <BButton variant="link" size="sm" class="w-100" @click="voltar">
                Voltar e informar outro usuário
              </BButton>
            </BForm>
          </BCard>

          <p class="text-center small mt-3 mb-0">
            <RouterLink :to="{ name: 'home' }" class="text-decoration-none">
              <i class="bi bi-arrow-left me-1" />Voltar ao site
            </RouterLink>
          </p>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  BContainer,
  BRow,
  BCol,
  BCard,
  BForm,
  BFormGroup,
  BFormInput,
  BButton,
  BAlert,
  BSpinner
} from 'bootstrap-vue-next';

import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const username = ref('');
const senha = ref('');
const codigo = ref('');

async function entrar() {
  try {
    await auth.entrar(username.value, senha.value);
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
  senha.value = '';
  codigo.value = '';
}
</script>

<style scoped>
.letter-spacing {
  letter-spacing: 0.5rem;
}
</style>
