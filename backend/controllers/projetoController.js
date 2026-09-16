import { Op } from 'sequelize';

import crudFactory from './crudFactory.js';
import asyncHandler from '../helpers/asyncHandler.js';
import ApiError from '../helpers/ApiError.js';
import { ehAdmin, ehOrientando, exigirPosse } from '../helpers/auth.js';
import { Projeto, Pesquisador, Orientacao } from '../models/index.js';

const includes = [
  { model: Pesquisador, as: 'coordenador', attributes: ['id', 'nome', 'email'] },
  { model: Pesquisador, as: 'equipe', attributes: ['id', 'nome'], through: { attributes: [] } }
];

/**
 * O que cada papel enxerga na listagem:
 *   administrador → tudo
 *   pesquisador   → os projetos que ele coordena
 *   orientando    → apenas os projetos em que participa (tabela orientacacoes)
 */
async function escopoPorPapel(req) {
  const { usuario } = req;
  if (ehAdmin(usuario)) return {};

  if (ehOrientando(usuario)) {
    const vinculos = await Orientacao.findAll({
      where: { pesquisador_id: usuario.pesquisador_id },
      attributes: ['projetos_id']
    });
    return { id: { [Op.in]: vinculos.map((v) => v.projetos_id) } };
  }

  return { pesquisador_id: usuario.pesquisador_id };
}

const base = crudFactory({
  model: Projeto,
  nome: 'Projeto',
  includes,
  camposBusca: ['titulo', 'resumo'],
  filtrosPermitidos: ['status', 'tipo', 'pesquisador_id'],
  ordenacaoPadrao: [['titulo', 'ASC']],
  escopo: escopoPorPapel,
  campoDono: 'pesquisador_id'
});

/** POST /admin/projetos/:id/equipe — vincula um pesquisador ao projeto. */
export const adicionarMembro = asyncHandler(async (req, res) => {
  const { pesquisador_id } = req.body;
  const projeto = await Projeto.findByPk(req.params.id);
  if (!projeto) throw ApiError.notFound('Projeto não encontrado.');

  // só o coordenador do projeto (ou um administrador) monta a equipe
  exigirPosse(req.usuario, projeto, 'pesquisador_id');

  const pesquisador = await Pesquisador.findByPk(pesquisador_id);
  if (!pesquisador) throw ApiError.notFound('Pesquisador não encontrado.');

  const [vinculo, criado] = await Orientacao.findOrCreate({
    where: { projetos_id: projeto.id, pesquisador_id }
  });
  res.status(criado ? 201 : 200).json(vinculo);
});

/** DELETE /admin/projetos/:id/equipe/:pesquisadorId — remove o vínculo. */
export const removerMembro = asyncHandler(async (req, res) => {
  const projeto = await Projeto.findByPk(req.params.id);
  if (!projeto) throw ApiError.notFound('Projeto não encontrado.');
  exigirPosse(req.usuario, projeto, 'pesquisador_id');

  const removidos = await Orientacao.destroy({
    where: { projetos_id: req.params.id, pesquisador_id: req.params.pesquisadorId }
  });
  if (!removidos) throw ApiError.notFound('Vínculo não encontrado.');
  res.status(204).send();
});

export const { listar, buscar, criar, atualizar, remover } = base;
