import { literal } from 'sequelize';

import crudFactory from './crudFactory.js';
import asyncHandler from '../helpers/asyncHandler.js';
import ApiError from '../helpers/ApiError.js';
import { ehAdmin, exigirPosse } from '../helpers/auth.js';
import { parsePaginacao, montarResposta } from '../helpers/paginacao.js';
import { Vaga, Candidatura, Projeto, Pesquisador } from '../models/index.js';

/**
 * A vaga não tem dono próprio: responde por ela o coordenador do projeto.
 * Por isso a posse é sempre conferida no projeto (projetos.pesquisador_id).
 */
const includes = [
  {
    model: Projeto,
    as: 'projeto',
    attributes: ['id', 'titulo', 'pesquisador_id'],
    include: [{ model: Pesquisador, as: 'coordenador', attributes: ['id', 'nome'] }]
  }
];

// total de candidaturas recebidas, sem precisar carregar a lista
const totalCandidaturas = [
  literal('(SELECT COUNT(*) FROM candidaturas c WHERE c.vagas_id = `Vaga`.`id`)'),
  'total_candidaturas'
];

/**
 * Listagem por papel:
 *   administrador → todas as vagas
 *   pesquisador   → as vagas dos projetos que coordena
 *   orientando    → nenhuma (a rota já barra, isto é só uma segunda trava)
 */
function escopoPorPapel(req) {
  if (ehAdmin(req.usuario)) return {};
  return { '$projeto.pesquisador_id$': req.usuario.pesquisador_id ?? null };
}

const base = crudFactory({
  model: Vaga,
  nome: 'Vaga',
  includes,
  camposBusca: ['titulo', 'descricao'],
  filtrosPermitidos: ['projetos_id'],
  escopo: escopoPorPapel
});

/** Carrega o projeto e confere se o usuário pode abrir vagas nele. */
async function projetoDoUsuario(usuario, projetoId) {
  const projeto = await Projeto.findByPk(projetoId, { attributes: ['id', 'pesquisador_id'] });
  if (!projeto) throw ApiError.notFound('Projeto não encontrado.');
  if (!ehAdmin(usuario) && projeto.pesquisador_id !== usuario.pesquisador_id) {
    throw ApiError.forbidden('Você só pode abrir vagas nos projetos que coordena.');
  }
  return projeto;
}

/** Carrega a vaga (com o projeto) e confere a posse. */
async function vagaDoUsuario(usuario, id) {
  const vaga = await Vaga.findByPk(id, { include: includes });
  if (!vaga) throw ApiError.notFound('Vaga não encontrada.');
  exigirPosse(usuario, vaga.projeto, 'pesquisador_id');
  return vaga;
}

const completa = (id) =>
  Vaga.findByPk(id, { include: includes, attributes: { include: [totalCandidaturas] } });

/** GET /admin/vagas — com o total de candidaturas de cada vaga. */
export const listar = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePaginacao(req.query);
  const { rows, count } = await Vaga.findAndCountAll({
    where: await base.montarWhere(req),
    include: includes,
    attributes: { include: [totalCandidaturas] },
    order: [['prazo', 'DESC']],
    limit,
    offset,
    distinct: true
  });
  res.json(montarResposta({ rows, count, page, limit }));
});

/** GET /admin/vagas/:id */
export const buscar = asyncHandler(async (req, res) => {
  await vagaDoUsuario(req.usuario, req.params.id);
  res.json(await completa(req.params.id));
});

/** POST /admin/vagas — só em projeto que o pesquisador coordena. */
export const criar = asyncHandler(async (req, res) => {
  await projetoDoUsuario(req.usuario, req.body.projetos_id);
  const vaga = await Vaga.create(req.body);
  res.status(201).json(await completa(vaga.id));
});

/** PUT /admin/vagas/:id — trocar de projeto também exige ser coordenador do novo. */
export const atualizar = asyncHandler(async (req, res) => {
  const vaga = await vagaDoUsuario(req.usuario, req.params.id);
  if (req.body.projetos_id && req.body.projetos_id !== vaga.projetos_id) {
    await projetoDoUsuario(req.usuario, req.body.projetos_id);
  }
  await vaga.update(req.body);
  res.json(await completa(vaga.id));
});

/** DELETE /admin/vagas/:id — leva junto as candidaturas. */
export const remover = asyncHandler(async (req, res) => {
  const vaga = await vagaDoUsuario(req.usuario, req.params.id);
  await vaga.destroy();
  res.status(204).send();
});

/** GET /admin/vagas/:id/candidaturas — quem se candidatou, na ordem de chegada. */
export const candidaturas = asyncHandler(async (req, res) => {
  await vagaDoUsuario(req.usuario, req.params.id);
  const registros = await Candidatura.findAll({
    where: { vagas_id: req.params.id },
    order: [['criado_em', 'ASC']]
  });
  res.json({ data: registros });
});

/** DELETE /admin/vagas/:id/candidaturas/:candidaturaId */
export const removerCandidatura = asyncHandler(async (req, res) => {
  await vagaDoUsuario(req.usuario, req.params.id);
  const removidas = await Candidatura.destroy({
    where: { id: req.params.candidaturaId, vagas_id: req.params.id }
  });
  if (!removidas) throw ApiError.notFound('Candidatura não encontrada.');
  res.status(204).send();
});
