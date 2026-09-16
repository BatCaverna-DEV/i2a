import crudFactory from './crudFactory.js';
import { Curso, Pesquisador } from '../models/index.js';

const base = crudFactory({
  model: Curso,
  nome: 'Curso',
  includes: [{ model: Pesquisador, as: 'responsavel', attributes: ['id', 'nome', 'email'] }],
  camposBusca: ['titulo', 'resumo'],
  filtrosPermitidos: ['pesquisador_id'],
  ordenacaoPadrao: [['inicio', 'DESC']]
});

export const { listar, buscar, criar, atualizar, remover } = base;
