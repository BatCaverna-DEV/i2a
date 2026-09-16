/**
 * Fábrica de controllers CRUD. Evita repetir listar/buscar/criar/atualizar/remover
 * em cada recurso — os controllers concretos só declaram o model, os includes
 * e os campos pesquisáveis, e sobrescrevem o que for específico.
 *
 * Duas opções cuidam das permissões por papel:
 *
 *   escopo(req)   devolve um `where` extra aplicado à listagem, para que cada
 *                 perfil enxergue apenas o que lhe cabe;
 *   campoDono     nome da coluna que aponta para o pesquisador dono do
 *                 registro; quando informado, PUT e DELETE exigem posse.
 */
import { Op } from 'sequelize';

import ApiError from '../helpers/ApiError.js';
import asyncHandler from '../helpers/asyncHandler.js';
import { exigirPosse } from '../helpers/auth.js';
import { parsePaginacao, montarResposta } from '../helpers/paginacao.js';

export default function crudFactory({
  model,
  nome = 'Registro',
  includes = [],
  camposBusca = [],
  ordenacaoPadrao = [['id', 'ASC']],
  filtrosPermitidos = [],
  escopo = null,
  campoDono = null
}) {
  async function montarWhere(req) {
    const { query } = req;
    const where = {};

    if (query.q && camposBusca.length > 0) {
      where[Op.or] = camposBusca.map((campo) => ({ [campo]: { [Op.like]: `%${query.q}%` } }));
    }

    for (const campo of filtrosPermitidos) {
      if (query[campo] !== undefined && query[campo] !== '') {
        where[campo] = query[campo];
      }
    }

    // o escopo do papel tem a última palavra e não pode ser burlado por query
    if (escopo) Object.assign(where, (await escopo(req)) ?? {});

    return where;
  }

  const listar = asyncHandler(async (req, res) => {
    const { page, limit, offset } = parsePaginacao(req.query);
    const { rows, count } = await model.findAndCountAll({
      where: await montarWhere(req),
      include: includes,
      order: ordenacaoPadrao,
      limit,
      offset,
      distinct: true
    });
    res.json(montarResposta({ rows, count, page, limit }));
  });

  const buscar = asyncHandler(async (req, res) => {
    const registro = await model.findByPk(req.params.id, { include: includes });
    if (!registro) throw ApiError.notFound(`${nome} não encontrado.`);
    res.json(registro);
  });

  const criar = asyncHandler(async (req, res) => {
    const registro = await model.create(req.body);
    const completo = await model.findByPk(registro.id, { include: includes });
    res.status(201).json(completo);
  });

  const atualizar = asyncHandler(async (req, res) => {
    const registro = await model.findByPk(req.params.id);
    if (!registro) throw ApiError.notFound(`${nome} não encontrado.`);

    if (campoDono) exigirPosse(req.usuario, registro, campoDono);

    await registro.update(req.body);
    const completo = await model.findByPk(registro.id, { include: includes });
    res.json(completo);
  });

  const remover = asyncHandler(async (req, res) => {
    const registro = await model.findByPk(req.params.id);
    if (!registro) throw ApiError.notFound(`${nome} não encontrado.`);

    if (campoDono) exigirPosse(req.usuario, registro, campoDono);

    await registro.destroy();
    res.status(204).send();
  });

  return { listar, buscar, criar, atualizar, remover, montarWhere };
}
