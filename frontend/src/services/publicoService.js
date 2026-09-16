/** Chamadas do site público (rotas /publico, sem autenticação). */
import http from './http.js';

export const estatisticas = () => http.get('/publico/estatisticas').then((r) => r.data);
export const linhas = () => http.get('/publico/linhas').then((r) => r.data);

export const pesquisadores = (params) =>
  http.get('/publico/pesquisadores', { params }).then((r) => r.data);
export const pesquisador = (id) => http.get(`/publico/pesquisadores/${id}`).then((r) => r.data);

export const projetos = (params) => http.get('/publico/projetos', { params }).then((r) => r.data);
export const projeto = (id) => http.get(`/publico/projetos/${id}`).then((r) => r.data);

export const cursos = (params) => http.get('/publico/cursos', { params }).then((r) => r.data);
export const curso = (id) => http.get(`/publico/cursos/${id}`).then((r) => r.data);

export const producoes = (params) => http.get('/publico/producoes', { params }).then((r) => r.data);
