/**
 * Gestão das contas com acesso administrativo — restrito a administradores.
 *
 * Cadastrar um usuário aqui é o que AUTORIZA uma conta Google a entrar:
 * o login só aceita e-mails que existam nesta tabela.
 */
import asyncHandler from '../helpers/asyncHandler.js';
import ApiError from '../helpers/ApiError.js';
import { parsePaginacao, montarResposta } from '../helpers/paginacao.js';
import { Usuario, Pesquisador } from '../models/index.js';
import * as authService from '../helpers/authService.js';

const includes = [{ model: Pesquisador, as: 'pesquisador', attributes: ['id', 'nome', 'email'] }];

export const listar = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePaginacao(req.query);
  const { rows, count } = await Usuario.findAndCountAll({
    include: includes,
    order: [['username', 'ASC']],
    limit,
    offset,
    distinct: true
  });
  res.json(montarResposta({ rows, count, page, limit }));
});

export const buscar = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id, { include: includes });
  if (!usuario) throw ApiError.notFound('Usuário não encontrado.');
  res.json(usuario);
});

export const criar = asyncHandler(async (req, res) => {
  const { username, email, categoria, status, pesquisador_id } = req.body;

  const jaExiste = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } });
  if (jaExiste) throw ApiError.conflict('Já existe um usuário com esse e-mail.');

  const usuario = await Usuario.create({ username, email, categoria, status, pesquisador_id });
  res.status(201).json(authService.publicarUsuario(usuario));
});

export const atualizar = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) throw ApiError.notFound('Usuário não encontrado.');

  const { username, email, categoria, status, pesquisador_id } = req.body;

  // trocar o e-mail significa autorizar outra conta Google:
  // o vínculo antigo precisa cair junto.
  if (email && email.trim().toLowerCase() !== usuario.email) {
    usuario.email = email;
    usuario.google_sub = null;
  }

  if (username !== undefined) usuario.username = username;
  if (categoria !== undefined) usuario.categoria = categoria;
  if (status !== undefined) usuario.status = status;
  if (pesquisador_id !== undefined) usuario.pesquisador_id = pesquisador_id;

  await usuario.save();
  res.json(authService.publicarUsuario(usuario));
});

export const remover = asyncHandler(async (req, res) => {
  if (req.params.id === req.usuario.id) {
    throw ApiError.badRequest('Você não pode remover o próprio usuário.');
  }
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) throw ApiError.notFound('Usuário não encontrado.');
  await usuario.destroy();
  res.status(204).send();
});

/** POST /admin/usuarios/:id/desvincular — solta a conta Google deste usuário. */
export const desvincular = asyncHandler(async (req, res) => {
  await authService.desvincularGoogle(req.params.id);
  res.json({ mensagem: 'Conta Google desvinculada. O vínculo é refeito no próximo login.' });
});
