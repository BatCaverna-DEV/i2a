import crudFactory from './crudFactory.js';
import asyncHandler from '../helpers/asyncHandler.js';
import ApiError from '../helpers/ApiError.js';
import { Pesquisador, Linha, Titulacao, Projeto, Producao, Curso } from '../models/index.js';

const includes = [
  { model: Linha, as: 'linha' },
  { model: Titulacao, as: 'titulacoes' }
];

const base = crudFactory({
  model: Pesquisador,
  nome: 'Pesquisador',
  includes,
  camposBusca: ['nome', 'email', 'matricula'],
  filtrosPermitidos: ['linhas_id'],
  ordenacaoPadrao: [['nome', 'ASC']]
});

/** GET /admin/pesquisadores/:id/completo — currículo completo do pesquisador. */
export const completo = asyncHandler(async (req, res) => {
  const pesquisador = await Pesquisador.findByPk(req.params.id, {
    include: [
      { model: Linha, as: 'linha' },
      { model: Titulacao, as: 'titulacoes' },
      { model: Curso, as: 'cursos' },
      { model: Projeto, as: 'projetos', through: { attributes: [] } },
      { model: Producao, as: 'producoes', through: { attributes: [] } }
    ]
  });
  if (!pesquisador) throw ApiError.notFound('Pesquisador não encontrado.');
  res.json(pesquisador);
});

export const { listar, buscar, criar, atualizar, remover } = base;
