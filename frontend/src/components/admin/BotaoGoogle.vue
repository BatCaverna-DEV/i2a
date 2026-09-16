<template>
  <div>
    <!-- O Google renderiza o botão oficial dentro desta div. -->
    <div ref="container" class="d-flex justify-content-center" />

    <div v-if="carregandoScript" class="text-center py-2">
      <BSpinner small class="me-2" />
      <span class="i2a-meta">Carregando o Google…</span>
    </div>

    <BAlert :model-value="Boolean(erro)" variant="warning" class="py-2 small mt-3 mb-0">
      {{ erro }}
    </BAlert>
  </div>
</template>

<script setup>
/**
 * Botão "Entrar com o Google" (Google Identity Services).
 *
 * Carrega o script oficial sob demanda, renderiza o botão e emite o ID token
 * recebido. Quem valida esse token é o backend — aqui ele é apenas repassado.
 *
 * O Client ID é público por natureza (fica visível no HTML); o que garante a
 * segurança é a verificação da assinatura do lado do servidor.
 */
import { ref, onMounted } from 'vue';
import { BSpinner, BAlert } from 'bootstrap-vue-next';

import { GOOGLE_CLIENT_ID, USANDO_MOCKS } from '@/config';

const emit = defineEmits(['credential']);

const container = ref(null);
const carregandoScript = ref(true);
const erro = ref('');

const URL_SCRIPT = 'https://accounts.google.com/gsi/client';

/** Injeta o script do Google uma única vez por página. */
function carregarScript() {
  if (window.google?.accounts?.id) return Promise.resolve();

  const existente = document.querySelector(`script[src="${URL_SCRIPT}"]`);
  if (existente) {
    return new Promise((resolve, reject) => {
      existente.addEventListener('load', resolve);
      existente.addEventListener('error', reject);
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = URL_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('não foi possível carregar o script do Google'));
    document.head.appendChild(script);
  });
}

onMounted(async () => {
  // Em modo demonstração não há Client ID nem internet garantida:
  // mostra um botão simples que dispara um token falso.
  if (USANDO_MOCKS) {
    carregandoScript.value = false;
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2';
    botao.innerHTML = '<i class="bi bi-google"></i> Entrar com o Google (demonstração)';
    botao.addEventListener('click', () => emit('credential', 'mock-credential'));
    container.value?.appendChild(botao);
    return;
  }

  if (!GOOGLE_CLIENT_ID) {
    carregandoScript.value = false;
    erro.value =
      'VITE_GOOGLE_CLIENT_ID não está definido no .env — o botão do Google não pode ser exibido.';
    return;
  }

  try {
    await carregarScript();

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resposta) => emit('credential', resposta.credential),
      auto_select: false,
      cancel_on_tap_outside: true,
      ux_mode: 'popup'
    });

    window.google.accounts.id.renderButton(container.value, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      text: 'signin_with',
      locale: 'pt-BR',
      width: 280
    });
  } catch (e) {
    erro.value = `Não foi possível carregar o login do Google (${e.message}). Verifique sua conexão.`;
  } finally {
    carregandoScript.value = false;
  }
});
</script>
