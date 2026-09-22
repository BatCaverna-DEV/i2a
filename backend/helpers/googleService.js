/**
 * Verificação do ID token emitido pelo Google Identity Services.
 *
 * O frontend obtém o token no navegador (botão "Entrar com o Google") e o envia
 * para cá. A biblioteca oficial confere a assinatura contra as chaves públicas
 * do Google, o emissor, a expiração e o `aud` (o Client ID da nossa aplicação).
 *
 * NUNCA confie em dados do token sem essa verificação: um ID token é apenas um
 * JWT, e qualquer pessoa consegue forjar um se ninguém validar a assinatura.
 */
import { OAuth2Client } from 'google-auth-library';

import env from '../config/env.js';
import ApiError from './ApiError.js';

const cliente = new OAuth2Client(env.google.clientId);

/**
 * Valida o ID token e devolve o perfil já normalizado.
 * @returns {{sub:string,email:string,nome:string,avatar:string,dominio:string|null}}
 */
export async function verificarIdToken(credential) {
  if (!credential) throw ApiError.badRequest('Token do Google não informado.');

  let ticket;
  try {
    ticket = await cliente.verifyIdToken({
      idToken: credential,
      audience: env.google.clientId
    });
  } catch (error) {
    throw ApiError.unauthorized(`Token do Google inválido: ${error.message}`);
  }

  const payload = ticket.getPayload();
  if (!payload) throw ApiError.unauthorized('Token do Google sem conteúdo.');

  // O Google só garante que o e-mail é da pessoa se email_verified for true.
  if (!payload.email || payload.email_verified === false) {
    throw ApiError.unauthorized('A conta Google não tem e-mail verificado.');
  }

  return {
    sub: payload.sub,
    email: payload.email.trim().toLowerCase(),
    nome: payload.name ?? payload.email,
    avatar: payload.picture ?? null,
    dominio: payload.hd ?? null
  };
}

export default { verificarIdToken };
