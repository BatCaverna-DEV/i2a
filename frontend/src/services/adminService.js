/**
 * Chamadas da área administrativa (rotas /admin, exigem access token).
 *
 * Mesma estratégia do publicoService: implementação real e de demonstração com
 * assinaturas idênticas, escolhidas por `VITE_USE_MOCKS`.
 */
import http from './http.js';
import { USANDO_MOCKS } from '@/config';
import { admin as demo } from '@/mocks';

/** CRUD padrão de qualquer recurso administrativo. */
function recurso(caminho) {
  return {
    listar: (params) => http.get(`/admin/${caminho}`, { params }).then((r) => r.data),
    buscar: (id) => http.get(`/admin/${caminho}/${id}`).then((r) => r.data),
    criar: (payload) => http.post(`/admin/${caminho}`, payload).then((r) => r.data),
    atualizar: (id, payload) => http.put(`/admin/${caminho}/${id}`, payload).then((r) => r.data),
    remover: (id) => http.delete(`/admin/${caminho}/${id}`).then((r) => r.data)
  };
}

const real = {
  linhas: recurso('linhas'),
  titulacoes: recurso('titulacoes'),
  cursos: recurso('cursos'),

  pesquisadores: {
    ...recurso('pesquisadores'),
    completo: (id) => http.get(`/admin/pesquisadores/${id}/completo`).then((r) => r.data)
  },

  projetos: {
    ...recurso('projetos'),
    adicionarMembro: (id, pesquisador_id) =>
      http.post(`/admin/projetos/${id}/equipe`, { pesquisador_id }).then((r) => r.data),
    removerMembro: (id, pesquisadorId) =>
      http.delete(`/admin/projetos/${id}/equipe/${pesquisadorId}`).then((r) => r.data)
  },

  producoes: {
    ...recurso('producoes'),
    adicionarAutor: (id, pesquisador_id) =>
      http.post(`/admin/producoes/${id}/autores`, { pesquisador_id }).then((r) => r.data),
    removerAutor: (id, pesquisadorId) =>
      http.delete(`/admin/producoes/${id}/autores/${pesquisadorId}`).then((r) => r.data)
  },

  vagas: {
    ...recurso('vagas'),
    candidaturas: (id) => http.get(`/admin/vagas/${id}/candidaturas`).then((r) => r.data),
    removerCandidatura: (id, candidaturaId) =>
      http.delete(`/admin/vagas/${id}/candidaturas/${candidaturaId}`).then((r) => r.data)
  },

  usuarios: {
    ...recurso('usuarios'),
    desvincular: (id) => http.post(`/admin/usuarios/${id}/desvincular`).then((r) => r.data)
  }
};

const api = USANDO_MOCKS ? demo : real;

export const { linhas, titulacoes, cursos, pesquisadores, projetos, producoes, vagas, usuarios } =
  api;
