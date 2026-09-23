/**
 * Chamadas do site público (rotas /publico da API, sem autenticação).
 *
 * Cada função tem DUAS implementações com a mesma assinatura: a real, que fala
 * com o backend, e a de demonstração, que lê de `src/mocks`. A escolha acontece
 * uma única vez, aqui embaixo, conforme `VITE_USE_MOCKS`. As telas importam
 * sempre os mesmos nomes e não sabem qual das duas está ativa.
 */
import http from './http.js';
import { USANDO_MOCKS } from '@/config';
import { publico as demo } from '@/mocks';

const real = {
  estatisticas: () => http.get('/publico/estatisticas').then((r) => r.data),
  linhas: () => http.get('/publico/linhas').then((r) => r.data),

  pesquisadores: (params) => http.get('/publico/pesquisadores', { params }).then((r) => r.data),
  pesquisador: (id) => http.get(`/publico/pesquisadores/${id}`).then((r) => r.data),

  projetos: (params) => http.get('/publico/projetos', { params }).then((r) => r.data),
  projeto: (id) => http.get(`/publico/projetos/${id}`).then((r) => r.data),

  cursos: (params) => http.get('/publico/cursos', { params }).then((r) => r.data),
  curso: (id) => http.get(`/publico/cursos/${id}`).then((r) => r.data),

  producoes: (params) => http.get('/publico/producoes', { params }).then((r) => r.data),

  // vagas com prazo em aberto e candidatura do aluno
  vagas: (params) => http.get('/publico/vagas', { params }).then((r) => r.data),
  vaga: (id) => http.get(`/publico/vagas/${id}`).then((r) => r.data),
  candidatar: (id, payload) =>
    http.post(`/publico/vagas/${id}/candidaturas`, payload).then((r) => r.data)
};

const api = USANDO_MOCKS ? demo : real;

export const estatisticas = (...a) => api.estatisticas(...a);
export const linhas = (...a) => api.linhas(...a);
export const pesquisadores = (...a) => api.pesquisadores(...a);
export const pesquisador = (...a) => api.pesquisador(...a);
export const projetos = (...a) => api.projetos(...a);
export const projeto = (...a) => api.projeto(...a);
export const cursos = (...a) => api.cursos(...a);
export const curso = (...a) => api.curso(...a);
export const producoes = (...a) => api.producoes(...a);
export const vagas = (...a) => api.vagas(...a);
export const vaga = (...a) => api.vaga(...a);
export const candidatar = (...a) => api.candidatar(...a);
