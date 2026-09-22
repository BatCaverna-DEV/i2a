<template>
  <section>
    <SecaoTitulo
      eyebrow="Conta"
      titulo="Meu perfil"
      descricao="Dados vindos da sua conta Google e do seu vínculo no grupo."
      tag="h1"
    />

    <BRow class="g-3">
      <BCol lg="6">
        <div class="i2a-card i2a-card--estatico p-4 h-100">
          <div class="d-flex align-items-center gap-3 mb-4">
            <img
              v-if="auth.usuario?.avatar_url"
              :src="auth.usuario.avatar_url"
              alt=""
              class="rounded-circle"
              width="56"
              height="56"
              referrerpolicy="no-referrer"
            />
            <div
              v-else
              class="rounded-circle d-flex align-items-center justify-content-center"
              style="width: 56px; height: 56px; background: var(--i2a-azul-100)"
            >
              <i class="bi bi-person fs-4" style="color: var(--i2a-azul-700)" />
            </div>

            <div class="min-w-0">
              <p class="fw-semibold mb-0 text-truncate">{{ auth.nomeExibido }}</p>
              <p class="i2a-meta mb-0 text-truncate">{{ auth.usuario?.email }}</p>
            </div>
          </div>

          <dl class="row mb-0 small">
            <dt class="col-5 i2a-meta fw-normal">Usuário</dt>
            <dd class="col-7">{{ auth.usuario?.username }}</dd>

            <dt class="col-5 i2a-meta fw-normal">Categoria</dt>
            <dd class="col-7">{{ CATEGORIA_USUARIO[auth.usuario?.categoria] ?? '—' }}</dd>

            <dt class="col-5 i2a-meta fw-normal">Pesquisador</dt>
            <dd class="col-7 mb-0">{{ auth.usuario?.pesquisador?.nome ?? '—' }}</dd>
          </dl>
        </div>
      </BCol>

      <BCol lg="6">
        <div class="i2a-card i2a-card--estatico p-4 h-100">
          <p class="i2a-eyebrow mb-3">Acesso</p>

          <p class="small text-body-secondary">
            Este sistema não guarda senha: quem confirma a sua identidade é o Google.
            Para trocar a senha, ativar verificação em duas etapas ou encerrar sessões,
            use as configurações da sua Conta Google.
          </p>

          <a
            href="https://myaccount.google.com/security"
            target="_blank"
            rel="noopener"
            class="btn btn-sm btn-outline-primary mb-4"
          >
            Segurança da Conta Google <i class="bi bi-box-arrow-up-right ms-1" />
          </a>

          <hr class="i2a-rule mb-4" />

          <BAlert :model-value="Boolean(mensagem)" variant="success" class="py-2 small">
            {{ mensagem }}
          </BAlert>
          <BAlert :model-value="Boolean(erro)" variant="danger" class="py-2 small">
            {{ erro }}
          </BAlert>

          <p class="i2a-eyebrow mb-2">Desvincular esta conta Google</p>
          <p class="small text-body-secondary">
            Use se você trocou de conta Google mantendo o mesmo e-mail cadastrado.
            Você será desconectado e o vínculo é refeito no próximo login.
          </p>
          <BButton size="sm" variant="outline-danger" :disabled="ocupado" @click="desvincular">
            Desvincular e sair
          </BButton>
        </div>
      </BCol>
    </BRow>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { BRow, BCol, BButton, BAlert } from 'bootstrap-vue-next';

import SecaoTitulo from '@/components/comum/SecaoTitulo.vue';
import * as authService from '@/services/authService';
import { mensagemDeErro } from '@/services/http';
import { useAuthStore } from '@/stores/auth';
import { CATEGORIA_USUARIO } from '@/utils/formatadores';

const auth = useAuthStore();
const router = useRouter();

const ocupado = ref(false);
const mensagem = ref('');
const erro = ref('');

async function desvincular() {
  if (!window.confirm('Desvincular a conta Google e sair do sistema?')) return;

  ocupado.value = true;
  erro.value = '';
  try {
    await authService.desvincular();
    auth.sair();
    router.push({ name: 'admin-login' });
  } catch (e) {
    erro.value = mensagemDeErro(e);
  } finally {
    ocupado.value = false;
  }
}
</script>
