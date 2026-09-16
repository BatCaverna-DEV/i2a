import crudFactory from './crudFactory.js';
import { ehAdmin } from '../helpers/auth.js';
import { Titulacao, Pesquisador } from '../models/index.js';

/** Quem não é administrador só enxerga e altera os próprios registros. */
const escopoPorPapel = (req) =>
  ehAdmin(req.usuario) ? {} : { pesquisador_id: req.usuario.pesquisador_id };

const base = crudFactory({
  model: Titulacao,
  nome: 'Titulação',
  includes: [{ model: Pesquisador, as: 'pesquisador', attributes: ['id', 'nome'] }],
  camposBusca: ['titulo', 'instituicao'],
  filtrosPermitidos: ['pesquisador_id', 'ano'],
  ordenacaoPadrao: [['ano', 'DESC']],
  escopo: escopoPorPapel,
  campoDono: 'pesquisador_id'
});

export const { listar, buscar, criar, atualizar, remover } = base;
