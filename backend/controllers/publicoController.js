/**
 * Endpoints consumidos pelo site público. São somente leitura, sem autenticação,
 * e devolvem apenas os campos que devem ser exibidos a visitantes externos.
 * A exceção é `candidatar`, que grava a candidatura de um aluno a uma vaga.
 */
import { Op, fn, col, literal, UniqueConstraintError } from 'sequelize';

import asyncHandler from '../helpers/asyncHandler.js';
import ApiError from '../helpers/ApiError.js';
import { parsePaginacao, montarResposta } from '../helpers/paginacao.js';
import {
  Pesquisador,
  Linha,
  Titulacao,
  Curso,
  Projeto,
  Producao,
  Vaga,
  Candidatura,
  CATEGORIA_USUARIO
} from '../models/index.js';
import { STATUS_PROJETO } from '../models/Projeto.js';

/**
 * Filtro dos números públicos: quem tem conta de Administrador não entra na
 * contagem de pesquisadores. Pesquisadores sem conta de acesso continuam
 * contando.
 */
const naoAdministrador = {
  id: {
    [Op.notIn]: literal(
      `(SELECT pesquisador_id FROM usuarios
         WHERE categoria = ${CATEGORIA_USUARIO.ADMINISTRADOR} AND pesquisador_id IS NOT NULL)`
    )
  }
};

/** GET /publico/linhas — linhas de pesquisa com a contagem de pesquisadores (sem administradores). */
export const linhas = asyncHandler(async (req, res) => {
  const registros = await Linha.findAll({
    attributes: {
      include: [[fn('COUNT', col('pesquisadores.id')), 'total_pesquisadores']]
    },
    // required: false mantém as linhas sem ninguém; o where vai para o ON do LEFT JOIN
    include: [
      {
        model: Pesquisador,
        as: 'pesquisadores',
        attributes: [],
        where: naoAdministrador,
        required: false
      }
    ],
    group: ['Linha.id'],
    order: [['descricao', 'ASC']]
  });
  res.json({ data: registros });
});

/**
 * GET /publico/pesquisadores — equipe do grupo (?q, ?linha, ?tipo=1|2).
 * Quem tem conta de Administrador não aparece. A lista vem com os
 * pesquisadores primeiro e os alunos depois, cada grupo em ordem alfabética.
 */
export const pesquisadores = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePaginacao(req.query, { limitePadrao: 24 });
  const where = { ...naoAdministrador };
  if (req.query.linha) where.linhas_id = req.query.linha;
  if (req.query.tipo) where.tipo = Number(req.query.tipo);
  if (req.query.q) where.nome = { [Op.like]: `%${req.query.q}%` };

  const { rows, count } = await Pesquisador.findAndCountAll({
    attributes: ['id', 'nome', 'email', 'tipo', 'linhas_id'],
    where,
    include: [{ model: Linha, as: 'linha', attributes: ['id', 'descricao'] }],
    order: [
      ['tipo', 'ASC'], // 1 Pesquisador antes de 2 Aluno
      ['nome', 'ASC']
    ],
    limit,
    offset,
    distinct: true
  });
  res.json(montarResposta({ rows, count, page, limit }));
});

/** GET /publico/pesquisadores/:id — perfil público do pesquisador. */
export const pesquisador = asyncHandler(async (req, res) => {
  const registro = await Pesquisador.findByPk(req.params.id, {
    attributes: ['id', 'nome', 'email', 'tipo', 'lattes'],
    include: [
      { model: Linha, as: 'linha', attributes: ['id', 'descricao'] },
      { model: Titulacao, as: 'titulacoes', attributes: ['titulo', 'instituicao', 'ano'] },
      {
        model: Producao,
        as: 'producoes',
        attributes: ['id', 'titulo', 'ano', 'veiculo', 'tipo', 'doi', 'url'],
        through: { attributes: [] }
      },
      {
        model: Projeto,
        as: 'projetos',
        attributes: ['id', 'titulo', 'ano', 'status', 'tipo'],
        through: { attributes: [] }
      }
    ]
  });
  if (!registro) throw ApiError.notFound('Pesquisador não encontrado.');
  res.json(registro);
});

/** GET /publico/projetos — projetos divulgados no site. */
export const projetos = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePaginacao(req.query, { limitePadrao: 12 });
  const where = { status: { [Op.ne]: STATUS_PROJETO.EM_ELABORACAO } };
  if (req.query.status !== undefined) where.status = Number(req.query.status);
  if (req.query.tipo !== undefined) where.tipo = Number(req.query.tipo);
  if (req.query.ano) where.ano = Number(req.query.ano);

  const { rows, count } = await Projeto.findAndCountAll({
    attributes: ['id', 'titulo', 'resumo', 'ano', 'status', 'tipo'],
    where,
    include: [{ model: Pesquisador, as: 'coordenador', attributes: ['id', 'nome'] }],
    order: [['titulo', 'ASC']],
    limit,
    offset,
    distinct: true
  });
  res.json(montarResposta({ rows, count, page, limit }));
});

/** GET /publico/projetos/:id */
export const projeto = asyncHandler(async (req, res) => {
  const registro = await Projeto.findByPk(req.params.id, {
    attributes: ['id', 'titulo', 'resumo', 'ano', 'status', 'tipo'],
    include: [
      { model: Pesquisador, as: 'coordenador', attributes: ['id', 'nome'] },
      { model: Pesquisador, as: 'equipe', attributes: ['id', 'nome'], through: { attributes: [] } }
    ]
  });
  if (!registro) throw ApiError.notFound('Projeto não encontrado.');
  res.json(registro);
});

/** GET /publico/cursos — cursos ofertados; ?abertos=1 filtra inscrições abertas. */
export const cursos = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePaginacao(req.query, { limitePadrao: 12 });
  const where = {};

  if (req.query.abertos === '1') {
    const agora = new Date();
    where.inscricoes_inicio = { [Op.lte]: agora };
    where.inscricoes_fim = { [Op.gte]: agora };
  }

  const { rows, count } = await Curso.findAndCountAll({
    where,
    include: [{ model: Pesquisador, as: 'responsavel', attributes: ['id', 'nome'] }],
    order: [['inicio', 'DESC']],
    limit,
    offset,
    distinct: true
  });
  res.json(montarResposta({ rows, count, page, limit }));
});

/** GET /publico/cursos/:id */
export const curso = asyncHandler(async (req, res) => {
  const registro = await Curso.findByPk(req.params.id, {
    include: [{ model: Pesquisador, as: 'responsavel', attributes: ['id', 'nome', 'email'] }]
  });
  if (!registro) throw ApiError.notFound('Curso não encontrado.');
  res.json(registro);
});

/** GET /publico/producoes — produção científica do grupo. */
export const producoes = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePaginacao(req.query, { limitePadrao: 20 });
  const where = {};
  if (req.query.ano) where.ano = Number(req.query.ano);
  if (req.query.tipo) where.tipo = Number(req.query.tipo);
  if (req.query.q) where.titulo = { [Op.like]: `%${req.query.q}%` };

  const { rows, count } = await Producao.findAndCountAll({
    where,
    include: [
      { model: Pesquisador, as: 'autores', attributes: ['id', 'nome'], through: { attributes: [] } }
    ],
    order: [
      ['ano', 'DESC'],
      ['titulo', 'ASC']
    ],
    limit,
    offset,
    distinct: true
  });
  res.json(montarResposta({ rows, count, page, limit }));
});

/** GET /publico/estatisticas — números exibidos na home e no painel (pesquisadores sem administradores). */
export const estatisticas = asyncHandler(async (req, res) => {
  const [totalPesquisadores, totalProjetos, totalCursos, totalProducoes, totalLinhas] =
    await Promise.all([
      Pesquisador.count({ where: naoAdministrador }),
      Projeto.count(),
      Curso.count(),
      Producao.count(),
      Linha.count()
    ]);

  const producaoPorAno = await Producao.findAll({
    attributes: ['ano', [fn('COUNT', col('id')), 'total']],
    where: { ano: { [Op.ne]: null } },
    group: ['ano'],
    order: [[literal('ano'), 'ASC']]
  });

  res.json({
    totalPesquisadores,
    totalProjetos,
    totalCursos,
    totalProducoes,
    totalLinhas,
    producaoPorAno
  });
});

/* ----------------------------- vagas ------------------------------ */

const atributosVaga = ['id', 'titulo', 'descricao', 'quantidade', 'prazo'];
const projetoDaVaga = {
  model: Projeto,
  as: 'projeto',
  attributes: ['id', 'titulo'],
  include: [{ model: Pesquisador, as: 'coordenador', attributes: ['id', 'nome'] }]
};

/** GET /publico/vagas — vagas com prazo em aberto (?projeto filtra), prazo mais próximo primeiro. */
export const vagas = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePaginacao(req.query, { limitePadrao: 20 });
  const where = { prazo: { [Op.gte]: new Date() } };
  if (req.query.projeto) where.projetos_id = req.query.projeto;

  const { rows, count } = await Vaga.findAndCountAll({
    attributes: atributosVaga,
    where,
    include: [projetoDaVaga],
    order: [['prazo', 'ASC']],
    limit,
    offset,
    distinct: true
  });
  res.json(montarResposta({ rows, count, page, limit }));
});

/**
 * GET /publico/vagas/:id — detalhe da vaga. Uma vaga encerrada ainda abre
 * (o link pode ter sido compartilhado), mas volta com `aberta: false`.
 */
export const vaga = asyncHandler(async (req, res) => {
  const registro = await Vaga.findByPk(req.params.id, {
    attributes: atributosVaga,
    include: [projetoDaVaga]
  });
  if (!registro) throw ApiError.notFound('Vaga não encontrada.');
  res.json({ ...registro.toJSON(), aberta: registro.aberta() });
});

/** POST /publico/vagas/:id/candidaturas — candidatura do aluno (nome, matrícula, e-mail acadêmico). */
export const candidatar = asyncHandler(async (req, res) => {
  const registro = await Vaga.findByPk(req.params.id, { attributes: ['id', 'prazo'] });
  if (!registro) throw ApiError.notFound('Vaga não encontrada.');
  if (!registro.aberta()) throw ApiError.badRequest('O prazo desta vaga já encerrou.');

  const { nome, matricula, email } = req.body;
  try {
    const candidatura = await Candidatura.create({ nome, matricula, email, vagas_id: registro.id });
    // devolve só a confirmação, sem ecoar dados pessoais além do necessário
    res.status(201).json({
      id: candidatura.id,
      criado_em: candidatura.criado_em,
      mensagem: 'Candidatura recebida.'
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw ApiError.conflict('Já existe uma candidatura a esta vaga com esse e-mail ou matrícula.');
    }
    throw error;
  }
});
