import crudFactory from './crudFactory.js';
import { ehAdmin } from '../helpers/auth.js';
import { Curso, Pesquisador } from '../models/index.js';

/** Quem não é administrador só enxerga e altera os próprios registros. */
const escopoPorPapel = (req) =>
  ehAdmin(req.usuario) ? {} : { pesquisador_id: req.usuario.pesquisador_id };

const base = crudFactory({
  model: Curso,
  nome: 'Curso',
  includes: [{ model: Pesquisador, as: 'responsavel', attributes: ['id', 'nome', 'email'] }],
  camposBusca: ['titulo', 'resumo'],
  filtrosPermitidos: ['pesquisador_id'],
  ordenacaoPadrao: [['inicio', 'DESC']],
  escopo: escopoPorPapel,
  campoDono: 'pesquisador_id'
});

export const { listar, buscar, criar, atualizar, remover } = base;
