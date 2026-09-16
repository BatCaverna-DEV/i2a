/**
 * Middlewares de autenticação e autorização.
 *
 *  - autenticar          -> exige um access token JWT válido no header Authorization
 *  - autorizar(...cats)  -> restringe a rota a determinadas categorias de usuário
 *  - donoOuAdmin(campo)  -> permite ao pesquisador mexer apenas nos próprios registros
 */
import jwt from 'jsonwebtoken';

import env from '../config/env.js';
import ApiError from './ApiError.js';
import { Usuario, CATEGORIA_USUARIO, STATUS_USUARIO } from '../models/index.js';

function extrairToken(req) {
  const header = req.headers.authorization ?? '';
  const [esquema, token] = header.split(' ');
  if (esquema !== 'Bearer' || !token) return null;
  return token;
}

export async function autenticar(req, res, next) {
  try {
    const token = extrairToken(req);
    if (!token) throw ApiError.unauthorized('Token de acesso não informado.');

    let payload;
    try {
      payload = jwt.verify(token, env.jwt.secret);
    } catch (e) {
      throw ApiError.unauthorized(
        e.name === 'TokenExpiredError' ? 'Sessão expirada, faça login novamente.' : 'Token inválido.'
      );
    }

    if (payload.tipo !== 'access') {
      throw ApiError.unauthorized('Tipo de token inadequado para esta operação.');
    }

    const usuario = await Usuario.findByPk(payload.sub);
    if (!usuario) throw ApiError.unauthorized('Usuário não encontrado.');
    if (usuario.status !== STATUS_USUARIO.ATIVO) {
      throw ApiError.forbidden('Usuário inativo ou bloqueado.');
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    next(error);
  }
}

export function autorizar(...categorias) {
  return function middleware(req, res, next) {
    if (!req.usuario) return next(ApiError.unauthorized());
    if (!categorias.includes(req.usuario.categoria)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}

/**
 * Garante que um pesquisador só altere registros vinculados a ele mesmo.
 * Administradores e coordenadores passam direto.
 */
export function donoOuAdmin(campo = 'pesquisador_id') {
  return function middleware(req, res, next) {
    const { usuario } = req;
    if (!usuario) return next(ApiError.unauthorized());

    if ([CATEGORIA_USUARIO.ADMIN, CATEGORIA_USUARIO.COORDENADOR].includes(usuario.categoria)) {
      return next();
    }

    const alvo = req.body?.[campo] ?? req.params?.[campo];
    if (alvo && alvo !== usuario.pesquisador_id) {
      return next(ApiError.forbidden('Você só pode manipular os seus próprios registros.'));
    }

    // força o vínculo ao próprio pesquisador em criações
    if (req.body && req.method === 'POST') req.body[campo] = usuario.pesquisador_id;
    next();
  };
}
