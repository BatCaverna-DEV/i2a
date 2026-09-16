import crudFactory from './crudFactory.js';
import asyncHandler from '../helpers/asyncHandler.js';
import ApiError from '../helpers/ApiError.js';
import { Projeto, Pesquisador, Orientacao } from '../models/index.js';

const includes = [
  { model: Pesquisador, as: 'coordenador', attributes: ['id', 'nome', 'email'] },
  { model: Pesquisador, as: 'equipe', attributes: ['id', 'nome'], through: { attributes: [] } }
];

const base = crudFactory({
  model: Projeto,
  nome: 'Projeto',
  includes,
  camposBusca: ['titulo', 'resumo'],
  filtrosPermitidos: ['status', 'tipo', 'pesquisador_id'],
  ordenacaoPadrao: [['titulo', 'ASC']]
});

/** POST /admin/projetos/:id/equipe — vincula um pesquisador ao projeto. */
export const adicionarMembro = asyncHandler(async (req, res) => {
  const { pesquisador_id } = req.body;
  const projeto = await Projeto.findByPk(req.params.id);
  if (!projeto) throw ApiError.notFound('Projeto não encontrado.');

  const pesquisador = await Pesquisador.findByPk(pesquisador_id);
  if (!pesquisador) throw ApiError.notFound('Pesquisador não encontrado.');

  const [vinculo, criado] = await Orientacao.findOrCreate({
    where: { projetos_id: projeto.id, pesquisador_id }
  });
  res.status(criado ? 201 : 200).json(vinculo);
});

/** DELETE /admin/projetos/:id/equipe/:pesquisadorId — remove o vínculo. */
export const removerMembro = asyncHandler(async (req, res) => {
  const removidos = await Orientacao.destroy({
    where: { projetos_id: req.params.id, pesquisador_id: req.params.pesquisadorId }
  });
  if (!removidos) throw ApiError.notFound('Vínculo não encontrado.');
  res.status(204).send();
});

export const { listar, buscar, criar, atualizar, remover } = base;
