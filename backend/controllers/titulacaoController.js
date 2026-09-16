import crudFactory from './crudFactory.js';
import { Titulacao, Pesquisador } from '../models/index.js';

const base = crudFactory({
  model: Titulacao,
  nome: 'Titulação',
  includes: [{ model: Pesquisador, as: 'pesquisador', attributes: ['id', 'nome'] }],
  camposBusca: ['titulo', 'instituicao'],
  filtrosPermitidos: ['pesquisador_id', 'ano'],
  ordenacaoPadrao: [['ano', 'DESC']]
});

export const { listar, buscar, criar, atualizar, remover } = base;
