/**
 * Estado global da sessão administrativa.
 * O login tem duas etapas: `senha` -> `codigo` (Google Authenticator) -> `autenticado`.
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

  // estado intermediário da autenticação em dois passos
  const etapa = ref('senha'); // 'senha' | 'cadastrar-2fa' | 'verificar-2fa'
  const mfaToken = ref('');
  const qrCode = ref('');
  const segredo = ref('');

  const autenticado = computed(() => Boolean(accessToken.value && usuario.value));
  const ehAdmin = computed(() => usuario.value?.categoria === CATEGORIA.ADMIN);
  const ehGestor = computed(() =>
    [CATEGORIA.ADMIN, CATEGORIA.COORDENADOR].includes(usuario.value?.categoria)
  );

  function guardarTokens({ accessToken: at, refreshToken: rt }) {
    accessToken.value = at;
    localStorage.setItem(CHAVE_ACCESS, at);
    localStorage.setItem(CHAVE_REFRESH, rt);
  }

  function limpar() {
    usuario.value = null;
    accessToken.value = null;
    etapa.value = 'senha';
    mfaToken.value = '';
    qrCode.value = '';
    segredo.value = '';
    localStorage.removeItem(CHAVE_ACCESS);
    localStorage.removeItem(CHAVE_REFRESH);
  }

  /** Etapa 1: usuário e senha. */
  async function entrar(username, senha) {
    carregando.value = true;
    erro.value = '';
    try {
      const resposta = await authService.login(username, senha);
      etapa.value = resposta.etapa;
      mfaToken.value = resposta.mfaToken;
      qrCode.value = resposta.qrCode ?? '';
      segredo.value = resposta.segredo ?? '';
      return resposta;
    } catch (e) {
      erro.value = mensagemDeErro(e, 'Não foi possível entrar.');
      throw e;
    } finally {
      carregando.value = false;
    }
  }

  /** Etapa 2: código de 6 dígitos do Google Authenticator. */
  async function confirmarCodigo(codigo) {
    carregando.value = true;
    erro.value = '';
    try {
      const resposta = await authService.verificar(mfaToken.value, codigo);
      guardarTokens(resposta);
      usuario.value = resposta.usuario;
      etapa.value = 'senha';
      mfaToken.value = '';
      qrCode.value = '';
      segredo.value = '';
      return resposta;
    } catch (e) {
      erro.value = mensagemDeErro(e, 'Código inválido.');
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
  }

  return {
    usuario,
    accessToken,
    carregando,
    erro,
    etapa,
    mfaToken,
    qrCode,
    segredo,
    autenticado,
    ehAdmin,
    ehGestor,
    entrar,
    confirmarCodigo,
    restaurarSessao,
    sair
  };
});
