/**
 * Pesquisadores.
 *
 * Cadastrar um pesquisador cria, na MESMA transação, a conta de acesso
 * correspondente — não existe pesquisador sem usuário. A categoria escolhida
 * no formulário (Administrador, Pesquisador ou Orientando) é o que define o
 * que a pessoa poderá fazer no painel.
 *
 * Quem pode cadastrar:
 *   - administrador: qualquer categoria;
 *   - pesquisador:   apenas orientandos;
 *   - orientando:    ninguém (perfil somente leitura).
 */
import crudFactory from './crudFactory.js';
import asyncHandler from '../helpers/asyncHandler.js';
import ApiError from '../helpers/ApiError.js';
import { parsePaginacao, montarResposta } from '../helpers/paginacao.js';
import { ehAdmin, ehPesquisador, exigirPosse } from '../helpers/auth.js';
import {
  sequelize,
  Pesquisador,
  Usuario,
  Linha,
  Titulacao,
  Projeto,
  Producao,
  Curso,
  CATEGORIA_USUARIO,
  ROTULO_CATEGORIA,
  STATUS_USUARIO,
  TIPO_PESQUISADOR
} from '../models/index.js';

const includes = [
  { model: Linha, as: 'linha' },
  { model: Titulacao, as: 'titulacoes' },
  {
    model: Usuario,
    as: 'usuarios',
    attributes: ['id', 'username', 'email', 'categoria', 'status', 'ultimo_acesso']
  }
];

const base = crudFactory({
  model: Pesquisador,
  nome: 'Pesquisador',
  includes,
  camposBusca: ['nome', 'email', 'matricula'],
  filtrosPermitidos: ['linhas_id', 'tipo'],
  ordenacaoPadrao: [['nome', 'ASC']]
});

/**
 * GET /admin/pesquisadores
 * Além da busca e do filtro por linha, aceita ?categoria= (tipo da conta de
 * acesso) — usado pelo cadastro de projeto para listar só os orientandos.
 */
export const listar = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePaginacao(req.query);
  const categoria = Number(req.query.categoria);

  const include = categoria
    ? includes.map((inc) =>
        inc.as === 'usuarios' ? { ...inc, where: { categoria }, required: true } : inc
      )
    : includes;

  const { rows, count } = await Pesquisador.findAndCountAll({
    where: await base.montarWhere(req),
    include,
    order: [['nome', 'ASC']],
    limit,
    offset,
    distinct: true
  });
  res.json(montarResposta({ rows, count, page, limit }));
});

/** Tipo padrão do pesquisador conforme a categoria da conta: Orientando → Aluno. */
const tipoPelaCategoria = (categoria) =>
  categoria === CATEGORIA_USUARIO.ORIENTANDO ? TIPO_PESQUISADOR.ALUNO : TIPO_PESQUISADOR.PESQUISADOR;

/** Gera um username livre a partir do e-mail. */
async function gerarUsername(email, transaction) {
  const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'usuario';
  let candidato = base;
  let sufixo = 1;

  while (await Usuario.findOne({ where: { username: candidato }, transaction })) {
    candidato = `${base}${++sufixo}`;
  }
  return candidato;
}

/** Confere se quem está logado pode criar alguém com a categoria pedida. */
function validarCategoriaPermitida(autor, categoria) {
  if (ehAdmin(autor)) return;

  if (ehPesquisador(autor)) {
    if (categoria !== CATEGORIA_USUARIO.ORIENTANDO) {
      throw ApiError.forbidden(
        'O perfil Pesquisador só pode cadastrar orientandos. ' +
          `Para criar um ${ROTULO_CATEGORIA[categoria]}, peça a um administrador.`
      );
    }
    return;
  }

  throw ApiError.forbidden('O perfil Orientando tem acesso somente de leitura.');
}

/**
 * POST /admin/pesquisadores
 * Cria o pesquisador e a conta de acesso numa única transação: se a criação
 * do usuário falhar (e-mail repetido, por exemplo), o pesquisador não fica
 * órfão no banco.
 */
export const criar = asyncHandler(async (req, res) => {
  const { nome, email, matricula, linhas_id, tipo, categoria } = req.body;

  validarCategoriaPermitida(req.usuario, categoria);

  const emailNormalizado = email.trim().toLowerCase();

  const jaExiste = await Usuario.findOne({ where: { email: emailNormalizado } });
  if (jaExiste) {
    throw ApiError.conflict(`Já existe uma conta de acesso com o e-mail ${emailNormalizado}.`);
  }

  const criado = await sequelize.transaction(async (transaction) => {
    const pesquisador = await Pesquisador.create(
      {
        nome,
        email: emailNormalizado,
        matricula,
        linhas_id,
        tipo: tipo ?? tipoPelaCategoria(categoria)
      },
      { transaction }
    );

    await Usuario.create(
      {
        username: await gerarUsername(emailNormalizado, transaction),
        email: emailNormalizado,
        nome,
        categoria,
        status: STATUS_USUARIO.ATIVO,
        pesquisador_id: pesquisador.id
      },
      { transaction }
    );

    return pesquisador;
  });

  const completo = await Pesquisador.findByPk(criado.id, { include: includes });
  res.status(201).json(completo);
});

/**
 * PUT /admin/pesquisadores/:id
 * Mantém a conta de acesso em dia: se o e-mail mudar, o vínculo com a conta
 * Google cai (é outro endereço); a categoria só pode ser alterada por um
 * administrador.
 */
export const atualizar = asyncHandler(async (req, res) => {
  const pesquisador = await Pesquisador.findByPk(req.params.id);
  if (!pesquisador) throw ApiError.notFound('Pesquisador não encontrado.');

  // pesquisador só edita o próprio cadastro (o dono aqui é o próprio id)
  exigirPosse(req.usuario, { pesquisador_id: pesquisador.id }, 'pesquisador_id');

  const { nome, email, matricula, linhas_id, tipo, categoria } = req.body;
  const emailNormalizado = email ? email.trim().toLowerCase() : null;

  if (categoria !== undefined && !ehAdmin(req.usuario)) {
    throw ApiError.forbidden('Somente um administrador pode alterar o tipo de usuário.');
  }

  await sequelize.transaction(async (transaction) => {
    await pesquisador.update(
      {
        ...(nome !== undefined && { nome }),
        ...(emailNormalizado && { email: emailNormalizado }),
        ...(matricula !== undefined && { matricula }),
        ...(linhas_id !== undefined && { linhas_id }),
        // tipo explícito vence; sem ele, mudar a categoria recalcula o tipo
        ...(tipo !== undefined
          ? { tipo }
          : categoria !== undefined && { tipo: tipoPelaCategoria(categoria) })
      },
      { transaction }
    );

    const conta = await Usuario.findOne({
      where: { pesquisador_id: pesquisador.id },
      transaction
    });
    if (!conta) return;

    if (emailNormalizado && emailNormalizado !== conta.email) {
      conta.email = emailNormalizado;
      conta.google_sub = null; // outro e-mail significa outra conta Google
    }
    if (nome !== undefined) conta.nome = nome;
    if (categoria !== undefined) conta.categoria = categoria;

    await conta.save({ transaction });
  });

  const completo = await Pesquisador.findByPk(pesquisador.id, { include: includes });
  res.json(completo);
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

/**
 * DELETE /admin/pesquisadores/:id
 * Remove a conta de acesso junto — deixar a conta viva daria acesso a alguém
 * que não existe mais no grupo.
 */
export const remover = asyncHandler(async (req, res) => {
  const pesquisador = await Pesquisador.findByPk(req.params.id);
  if (!pesquisador) throw ApiError.notFound('Pesquisador não encontrado.');

  if (pesquisador.id === req.usuario.pesquisador_id) {
    throw ApiError.badRequest('Você não pode remover o próprio cadastro.');
  }

  await sequelize.transaction(async (transaction) => {
    await Usuario.destroy({ where: { pesquisador_id: pesquisador.id }, transaction });
    await pesquisador.destroy({ transaction });
  });

  res.status(204).send();
});

export const { buscar } = base;
