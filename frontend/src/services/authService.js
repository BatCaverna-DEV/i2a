/** Chamadas do fluxo de autenticação em duas etapas. */
import http from './http.js';

export const login = (username, senha) =>
  http.post('/auth/login', { username, senha }).then((r) => r.data);

export const verificar = (mfaToken, codigo) =>
  http.post('/auth/verificar', { mfaToken, codigo }).then((r) => r.data);

export const eu = () => http.get('/auth/eu').then((r) => r.data);

export const trocarSenha = (senhaAtual, novaSenha, confirmacao) =>
  http.post('/auth/trocar-senha', { senhaAtual, novaSenha, confirmacao }).then((r) => r.data);

export const qrcode2fa = () => http.get('/auth/2fa/qrcode').then((r) => r.data);
export const reiniciar2fa = () => http.post('/auth/2fa/reiniciar').then((r) => r.data);
