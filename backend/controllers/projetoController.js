import { Op } from 'sequelize';

import crudFactory from './crudFactory.js';
import asyncHandler from '../helpers/asyncHandler.js';
import ApiError from '../helpers/ApiError.js';
import { ehAdmin, ehOrientando, exigirPosse } from '../helpers/auth.js';
import {
  sequelize,
  Projeto,
  Pesquisador,
  Orientacao,
  Usuario,
  CATEGORIA_USUARIO
} from '../models/index.js';

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
  filtrosPermitidos: ['status', 'tipo', 'ano', 'pesquisador_id'],
  ordenacaoPadrao: [['titulo', 'ASC']],
  escopo: escopoPorPapel,
  campoDono: 'pesquisador_id'
});

/** Ids, dentre os informados, cuja conta de acesso é do tipo Orientando. */
async function filtrarOrientandos(ids, transaction) {
  if (ids.length === 0) return new Set();
  const contas = await Usuario.findAll({
    where: { pesquisador_id: { [Op.in]: ids }, categoria: CATEGORIA_USUARIO.ORIENTANDO },
    attributes: ['pesquisador_id'],
    transaction
  });
  return new Set(contas.map((c) => c.pesquisador_id));
}

/**
 * Faz os orientandos do projeto (tabela orientacacoes) ficarem exatamente
 * iguais à lista recebida do formulário. Pesquisadores que não são
 * orientandos continuam na equipe — esta lista só governa os orientandos.
 */
async function sincronizarOrientandos(projetoId, ids, transaction) {
  const desejados = [...new Set(ids)];

  const validos = await filtrarOrientandos(desejados, transaction);
  if (validos.size !== desejados.length) {
    throw ApiError.badRequest(
      'Só é possível vincular como orientando quem tem o tipo de usuário Orientando.'
    );
  }

  const vinculos = await Orientacao.findAll({
    where: { projetos_id: projetoId },
    attributes: ['pesquisador_id'],
    transaction
  });
  const atuais = await filtrarOrientandos(
    vinculos.map((v) => v.pesquisador_id),
    transaction
  );

  const sair = [...atuais].filter((id) => !validos.has(id));
  const entrar = desejados.filter((id) => !atuais.has(id));

  if (sair.length > 0) {
    await Orientacao.destroy({
      where: { projetos_id: projetoId, pesquisador_id: { [Op.in]: sair } },
      transaction
    });
  }
  if (entrar.length > 0) {
    await Orientacao.bulkCreate(
      entrar.map((pesquisador_id) => ({ projetos_id: projetoId, pesquisador_id })),
      { transaction }
    );
  }
}

/** POST /admin/projetos — cria o projeto e, se vierem, vincula os orientandos. */
export const criar = asyncHandler(async (req, res) => {
  const { orientandos, ...dados } = req.body;

  const projeto = await sequelize.transaction(async (transaction) => {
    const criado = await Projeto.create(dados, { transaction });
    if (orientandos) await sincronizarOrientandos(criado.id, orientandos, transaction);
    return criado;
  });

  const completo = await Projeto.findByPk(projeto.id, { include: includes });
  res.status(201).json(completo);
});

/** PUT /admin/projetos/:id — atualiza o projeto e a lista de orientandos. */
export const atualizar = asyncHandler(async (req, res) => {
  const projeto = await Projeto.findByPk(req.params.id);
  if (!projeto) throw ApiError.notFound('Projeto não encontrado.');
  exigirPosse(req.usuario, projeto, 'pesquisador_id');

  const { orientandos, ...dados } = req.body;

  await sequelize.transaction(async (transaction) => {
    await projeto.update(dados, { transaction });
    if (orientandos) await sincronizarOrientandos(projeto.id, orientandos, transaction);
  });

  const completo = await Projeto.findByPk(projeto.id, { include: includes });
  res.json(completo);
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

export const { listar, buscar, remover } = base;
