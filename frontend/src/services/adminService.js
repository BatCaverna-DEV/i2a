/**
 * Chamadas da área administrativa (rotas /admin, exigem access token).
 * `recurso()` gera o CRUD padrão de qualquer entidade.
 */
import http from './http.js';

function recurso(caminho) {
  return {
    listar: (params) => http.get(`/admin/${caminho}`, { params }).then((r) => r.data),
    buscar: (id) => http.get(`/admin/${caminho}/${id}`).then((r) => r.data),
    criar: (payload) => http.post(`/admin/${caminho}`, payload).then((r) => r.data),
    atualizar: (id, payload) => http.put(`/admin/${caminho}/${id}`, payload).then((r) => r.data),
    remover: (id) => http.delete(`/admin/${caminho}/${id}`).then((r) => r.data)
  };
}

export const pesquisadores = {
  ...recurso('pesquisadores'),
  completo: (id) => http.get(`/admin/pesquisadores/${id}/completo`).then((r) => r.data)
};

export const linhas = recurso('linhas');
export const titulacoes = recurso('titulacoes');
export const cursos = recurso('cursos');
export const usuarios = {
  ...recurso('usuarios'),
  reiniciar2fa: (id) => http.post(`/admin/usuarios/${id}/reiniciar-2fa`).then((r) => r.data)
};

export const projetos = {
  ...recurso('projetos'),
  adicionarMembro: (id, pesquisador_id) =>
    http.post(`/admin/projetos/${id}/equipe`, { pesquisador_id }).then((r) => r.data),
  removerMembro: (id, pesquisadorId) =>
    http.delete(`/admin/projetos/${id}/equipe/${pesquisadorId}`).then((r) => r.data)
};

export const producoes = {
  ...recurso('producoes'),
  adicionarAutor: (id, pesquisador_id) =>
    http.post(`/admin/producoes/${id}/autores`, { pesquisador_id }).then((r) => r.data),
  removerAutor: (id, pesquisadorId) =>
    http.delete(`/admin/producoes/${id}/autores/${pesquisadorId}`).then((r) => r.data)
};
