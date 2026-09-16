import asyncHandler from '../helpers/asyncHandler.js';
import ApiError from '../helpers/ApiError.js';
import * as authService from '../helpers/authService.js';
import { Usuario, Pesquisador } from '../models/index.js';

/** POST /auth/google — login com a conta Google. */
export const google = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  res.json(await authService.entrarComGoogle(credential));
});

/** POST /auth/refresh — renova o access token. */
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw ApiError.badRequest('refreshToken é obrigatório.');
  res.json(await authService.renovar(refreshToken));
});

/** GET /auth/eu — dados do usuário autenticado. */
export const eu = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findByPk(req.usuario.id, {
    include: [{ model: Pesquisador, as: 'pesquisador' }]
  });
  res.json(authService.publicarUsuario(usuario));
});

/** POST /auth/desvincular — solta o vínculo com a conta Google atual. */
export const desvincular = asyncHandler(async (req, res) => {
  await authService.desvincularGoogle(req.usuario.id);
  res.json({
    mensagem: 'Conta Google desvinculada. O vínculo é refeito no próximo login.'
  });
});
