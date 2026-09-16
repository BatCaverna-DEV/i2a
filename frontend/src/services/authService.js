/**
 * Fluxo de autenticação em duas etapas.
 *
 * Em modo de demonstração (`VITE_USE_MOCKS=true`) qualquer usuário e senha
 * entram, e qualquer código de 6 dígitos é aceito — serve para percorrer as
 * telas do painel sem o backend no ar.
 */
import http from './http.js';
import { USANDO_MOCKS } from '@/config';
import { auth as demo } from '@/mocks';

const real = {
  login: (username, senha) => http.post('/auth/login', { username, senha }).then((r) => r.data),
  verificar: (mfaToken, codigo) =>
    http.post('/auth/verificar', { mfaToken, codigo }).then((r) => r.data),
  eu: () => http.get('/auth/eu').then((r) => r.data),
  trocarSenha: (senhaAtual, novaSenha, confirmacao) =>
    http.post('/auth/trocar-senha', { senhaAtual, novaSenha, confirmacao }).then((r) => r.data),
  qrcode2fa: () => http.get('/auth/2fa/qrcode').then((r) => r.data),
  reiniciar2fa: () => http.post('/auth/2fa/reiniciar').then((r) => r.data)
};

const api = USANDO_MOCKS ? demo : real;

export const login = (...a) => api.login(...a);
export const verificar = (...a) => api.verificar(...a);
export const eu = (...a) => api.eu(...a);
export const trocarSenha = (...a) => api.trocarSenha(...a);
export const qrcode2fa = (...a) => api.qrcode2fa(...a);
export const reiniciar2fa = (...a) => api.reiniciar2fa(...a);
