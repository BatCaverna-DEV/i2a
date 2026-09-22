<template>
  <div class="min-vh-100 d-flex flex-column">
    <BarraDemo />

    <div class="flex-grow-1 d-flex align-items-center py-5">
      <BContainer>
        <BRow class="justify-content-center">
          <BCol md="8" lg="5" xl="4">
            <div class="text-center mb-4">
              <p class="fw-bold h4 i2a-marca mb-1">{{ APP.sigla }}</p>
              <p class="i2a-meta mb-0">Área administrativa</p>
            </div>

            <div class="i2a-card i2a-card--estatico p-4 p-lg-5">
              <p class="text-center text-body-secondary small mb-4">
                O acesso é feito com a sua conta Google institucional ou pessoal,
                desde que ela tenha sido cadastrada pela coordenação do grupo.
              </p>

              <BAlert :model-value="Boolean(auth.erro)" variant="danger" class="py-2 small">
                {{ auth.erro }}
              </BAlert>

              <div v-if="auth.carregando" class="text-center py-3">
                <BSpinner class="mb-2" />
                <p class="i2a-meta mb-0">Verificando a conta…</p>
              </div>

              <BotaoGoogle v-else @credential="entrar" />

              <hr class="i2a-rule my-4" />

              <p class="i2a-meta text-center mb-0">
                Não consegue entrar? Fale com um administrador do grupo pelo e-mail
                <a :href="`mailto:${APP.email}`">{{ APP.email }}</a>.
              </p>
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
import { useRouter, useRoute } from 'vue-router';
import { BContainer, BRow, BCol, BAlert, BSpinner } from 'bootstrap-vue-next';

import BarraDemo from '@/components/comum/BarraDemo.vue';
import BotaoGoogle from '@/components/admin/BotaoGoogle.vue';
import { useAuthStore } from '@/stores/auth';
import { APP } from '@/config';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

async function entrar(credential) {
  try {
    await auth.entrarComGoogle(credential);
    router.push(route.query.redirect ?? { name: 'admin-dashboard' });
  } catch {
    /* a mensagem já está em auth.erro */
  }
}
</script>
