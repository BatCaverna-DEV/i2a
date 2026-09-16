/**
 * Autenticação por conta Google.
 *
 * O navegador obtém um ID token pelo botão do Google e o envia para
 * POST /auth/google; a API valida a assinatura e devolve os tokens JWT
 * da própria aplicação. Não existe senha em nenhum ponto do fluxo.
 *
 * Em modo de demonstração (`VITE_USE_MOCKS=true`) o botão devolve um token
 * falso e a API falsa aceita, para percorrer o painel sem o backend no ar.
 */
import http from './http.js';
import { USANDO_MOCKS } from '@/config';
import { auth as demo } from '@/mocks';

const real = {
  google: (credential) => http.post('/auth/google', { credential }).then((r) => r.data),
  eu: () => http.get('/auth/eu').then((r) => r.data),
  desvincular: () => http.post('/auth/desvincular').then((r) => r.data)
};

const api = USANDO_MOCKS ? demo : real;

export const google = (...a) => api.google(...a);
export const eu = (...a) => api.eu(...a);
export const desvincular = (...a) => api.desvincular(...a);
