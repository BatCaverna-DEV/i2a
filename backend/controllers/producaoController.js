import { Op } from 'sequelize';

import crudFactory from './crudFactory.js';
import asyncHandler from '../helpers/asyncHandler.js';
import ApiError from '../helpers/ApiError.js';
import { ehAdmin } from '../helpers/auth.js';
import { Producao, Pesquisador, Autor } from '../models/index.js';

const includes = [
  { model: Pesquisador, as: 'autores', attributes: ['id', 'nome'], through: { attributes: [] } }
];

/**
 * Produção não tem coluna de dono: a autoria vive na tabela `autores`.
 * Quem não é administrador vê apenas as publicações de que é autor.
 */
async function escopoPorPapel(req) {
  const { usuario } = req;
  if (ehAdmin(usuario)) return {};

  const autorias = await Autor.findAll({
    where: { pesquisador_id: usuario.pesquisador_id },
    attributes: ['producao_id']
  });
  return { id: { [Op.in]: autorias.map((a) => a.producao_id) } };
}

/** Só o administrador ou um dos autores altera a publicação. */
async function exigirAutoria(usuario, producaoId) {
  if (ehAdmin(usuario)) return;

  const autoria = await Autor.findOne({
    where: { producao_id: producaoId, pesquisador_id: usuario.pesquisador_id }
  });
  if (!autoria) {
    throw ApiError.forbidden('Você só pode alterar publicações das quais é autor.');
  }
}

const base = crudFactory({
  model: Producao,
  nome: 'Produção',
  includes,
  camposBusca: ['titulo', 'veiculo', 'doi'],
  filtrosPermitidos: ['ano', 'tipo', 'qualis'],
  ordenacaoPadrao: [['ano', 'DESC']],
  escopo: escopoPorPapel
});

/**
 * Ao criar, quem cadastrou já entra como autor — senão a publicação
 * desapareceria da própria listagem dele no instante seguinte.
 */
export const criar = asyncHandler(async (req, res) => {
  const producao = await Producao.create(req.body);

  if (req.usuario.pesquisador_id) {
    await Autor.findOrCreate({
      where: { producao_id: producao.id, pesquisador_id: req.usuario.pesquisador_id }
    });
  }

  const completo = await Producao.findByPk(producao.id, { include: includes });
  res.status(201).json(completo);
});

export const atualizar = asyncHandler(async (req, res) => {
  await exigirAutoria(req.usuario, req.params.id);
  return base.atualizar(req, res);
});

export const remover = asyncHandler(async (req, res) => {
  await exigirAutoria(req.usuario, req.params.id);
  return base.remover(req, res);
});

/** POST /admin/producoes/:id/autores — vincula um pesquisador à produção. */
export const adicionarAutor = asyncHandler(async (req, res) => {
  const { pesquisador_id } = req.body;
  const producao = await Producao.findByPk(req.params.id);
  if (!producao) throw ApiError.notFound('Produção não encontrada.');

  await exigirAutoria(req.usuario, producao.id);

  const pesquisador = await Pesquisador.findByPk(pesquisador_id);
  if (!pesquisador) throw ApiError.notFound('Pesquisador não encontrado.');

  const [vinculo, criado] = await Autor.findOrCreate({
    where: { producao_id: producao.id, pesquisador_id }
  });
  res.status(criado ? 201 : 200).json(vinculo);
});

/** DELETE /admin/producoes/:id/autores/:pesquisadorId — remove a autoria. */
export const removerAutor = asyncHandler(async (req, res) => {
  await exigirAutoria(req.usuario, req.params.id);

  const removidos = await Autor.destroy({
    where: { producao_id: req.params.id, pesquisador_id: req.params.pesquisadorId }
  });
  if (!removidos) throw ApiError.notFound('Autoria não encontrada.');
  res.status(204).send();
});

export const { listar, buscar } = base;
