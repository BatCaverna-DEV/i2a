/**
 * Estado global da sessão administrativa.
 *
 * O login tem um passo só: o botão do Google devolve um ID token, mandamos
 * para a API e recebemos de volta o par de tokens JWT. Não há senha nem
 * segunda etapa.
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import * as authService from '@/services/authService';
import { CHAVE_ACCESS, CHAVE_REFRESH, mensagemDeErro } from '@/services/http';

/** Espelha CATEGORIA_USUARIO do backend. */
export const CATEGORIA = Object.freeze({
  ADMIN: 1,
  COORDENADOR: 2,
  PESQUISADOR: 3
});

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(null);
  const accessToken = ref(localStorage.getItem(CHAVE_ACCESS));
  const carregando = ref(false);
  const erro = ref('');

  const autenticado = computed(() => Boolean(accessToken.value && usuario.value));
  const ehAdmin = computed(() => usuario.value?.categoria === CATEGORIA.ADMIN);
  const ehGestor = computed(() =>
    [CATEGORIA.ADMIN, CATEGORIA.COORDENADOR].includes(usuario.value?.categoria)
  );

  /** Nome curto para saudações e para o menu da conta. */
  const nomeExibido = computed(
    () => usuario.value?.pesquisador?.nome ?? usuario.value?.nome ?? usuario.value?.username ?? ''
  );

  function guardarTokens({ accessToken: at, refreshToken: rt }) {
    accessToken.value = at;
    localStorage.setItem(CHAVE_ACCESS, at);
    localStorage.setItem(CHAVE_REFRESH, rt);
  }

  function limpar() {
    usuario.value = null;
    accessToken.value = null;
    localStorage.removeItem(CHAVE_ACCESS);
    localStorage.removeItem(CHAVE_REFRESH);
  }

  /**
   * Troca o ID token do Google pelos tokens da aplicação.
   * @param {string} credential ID token devolvido pelo botão do Google
   */
  async function entrarComGoogle(credential) {
    carregando.value = true;
    erro.value = '';
    try {
      const resposta = await authService.google(credential);
      guardarTokens(resposta);
      usuario.value = resposta.usuario;
      return resposta;
    } catch (e) {
      erro.value = mensagemDeErro(e, 'Não foi possível entrar com essa conta Google.');
      limpar();
      throw e;
    } finally {
      carregando.value = false;
    }
  }

  /** Recarrega o usuário a partir do token salvo (chamado no boot do app). */
  async function restaurarSessao() {
    if (!accessToken.value || usuario.value) return;
    try {
      usuario.value = await authService.eu();
    } catch {
      limpar();
    }
  }

  function sair() {
    limpar();
    // encerra também a sessão do widget do Google, para que a próxima entrada
    // volte a perguntar qual conta usar
    window.google?.accounts?.id?.disableAutoSelect?.();
  }

  return {
    usuario,
    accessToken,
    carregando,
    erro,
    autenticado,
    ehAdmin,
    ehGestor,
    nomeExibido,
    entrarComGoogle,
    restaurarSessao,
    sair
  };
});
