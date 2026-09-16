import crudFactory from './crudFactory.js';
import { Linha } from '../models/index.js';

const base = crudFactory({
  model: Linha,
  nome: 'Linha de pesquisa',
  camposBusca: ['descricao'],
  ordenacaoPadrao: [['descricao', 'ASC']]
});

export const { listar, buscar, criar, atualizar, remover } = base;
