/**
 * Autenticação e autorização.
 *
 * Três papéis, definidos em models/Usuario.js:
 *
 *   1 ADMINISTRADOR — gerencia todos os dados do sistema.
 *   2 PESQUISADOR   — gerencia apenas o que é dele (projetos que coordena,
 *                     publicações de que é autor, cursos, titulações) e
 *                     cadastra os próprios orientandos.
 *   3 ORIENTANDO    — somente leitura, e apenas dos projetos em que participa.
 *
 * Middlewares oferecidos:
 *   autenticar               exige access token válido e usuário ativo
 *   autorizar(...categorias) restringe a rota a determinadas categorias
 *   somenteAdmin             atalho para autorizar(ADMINISTRADOR)
 *   bloquearOrientando       barra qualquer escrita vinda de um orientando
 *   donoOuAdmin(campo)       pesquisador só escreve nos próprios registros
 */
import jwt from 'jsonwebtoken';

import env from '../config/env.js';
import ApiError from './ApiError.js';
import { Usuario, CATEGORIA_USUARIO, ROTULO_CATEGORIA, STATUS_USUARIO } from '../models/index.js';

const METODOS_DE_ESCRITA = ['POST', 'PUT', 'PATCH', 'DELETE'];

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

/* ------------------------- atalhos de papel ------------------------ */

export const ehAdmin = (usuario) => usuario?.categoria === CATEGORIA_USUARIO.ADMINISTRADOR;
export const ehPesquisador = (usuario) => usuario?.categoria === CATEGORIA_USUARIO.PESQUISADOR;
export const ehOrientando = (usuario) => usuario?.categoria === CATEGORIA_USUARIO.ORIENTANDO;

/* --------------------------- middlewares -------------------------- */

export function autorizar(...categorias) {
  return function middleware(req, res, next) {
    if (!req.usuario) return next(ApiError.unauthorized());
    if (!categorias.includes(req.usuario.categoria)) {
      return next(
        ApiError.forbidden(
          `Esta operação não é permitida para o perfil ${ROTULO_CATEGORIA[req.usuario.categoria]}.`
        )
      );
    }
    next();
  };
}

export const somenteAdmin = autorizar(CATEGORIA_USUARIO.ADMINISTRADOR);

/** Orientando não escreve nada: o perfil é de leitura. */
export function bloquearOrientando(req, res, next) {
  if (!req.usuario) return next(ApiError.unauthorized());

  if (ehOrientando(req.usuario) && METODOS_DE_ESCRITA.includes(req.method)) {
    return next(
      ApiError.forbidden('O perfil Orientando tem acesso somente de leitura.')
    );
  }
  next();
}

/**
 * Restringe a escrita aos registros do próprio pesquisador.
 *
 * - administrador passa direto;
 * - orientando é barrado (não escreve);
 * - pesquisador: em POST o vínculo é forçado para ele mesmo; em PUT/DELETE
 *   quem confere a posse é o controller, que já carregou o registro.
 */
export function donoOuAdmin(campo = 'pesquisador_id') {
  return function middleware(req, res, next) {
    const { usuario } = req;
    if (!usuario) return next(ApiError.unauthorized());

    if (ehAdmin(usuario)) return next();

    if (ehOrientando(usuario) && METODOS_DE_ESCRITA.includes(req.method)) {
      return next(ApiError.forbidden('O perfil Orientando tem acesso somente de leitura.'));
    }

    if (!usuario.pesquisador_id) {
      return next(
        ApiError.forbidden(
          'Sua conta não está vinculada a um pesquisador. Procure um administrador.'
        )
      );
    }

    // criação: o registro nasce vinculado a quem está criando
    if (req.method === 'POST' && req.body) {
      req.body[campo] = usuario.pesquisador_id;
      return next();
    }

    // alteração: se o corpo tenta apontar para outro dono, barra aqui
    const alvo = req.body?.[campo];
    if (alvo && alvo !== usuario.pesquisador_id) {
      return next(ApiError.forbidden('Você só pode manipular os seus próprios registros.'));
    }

    next();
  };
}

/**
 * Confere a posse de um registro JÁ CARREGADO do banco.
 * Usado pelos controllers em PUT e DELETE, onde o dono só é conhecido
 * depois da consulta.
 */
export function exigirPosse(usuario, registro, campo = 'pesquisador_id') {
  if (ehAdmin(usuario)) return;

  if (registro?.[campo] !== usuario.pesquisador_id) {
    throw ApiError.forbidden('Você só pode manipular os seus próprios registros.');
  }
}
