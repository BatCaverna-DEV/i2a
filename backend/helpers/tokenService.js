/**
 * Emissão e verificação dos tokens JWT da própria aplicação.
 *
 * O ID token do Google serve só para provar quem é a pessoa, uma única vez, no
 * login. Depois disso quem manda é o nosso par de tokens:
 *
 *   access  -> usado no header Authorization das rotas administrativas
 *   refresh -> renova o access token sem passar de novo pelo Google
 */
import jwt from 'jsonwebtoken';

import env from '../config/env.js';
import ApiError from './ApiError.js';

export function gerarAccessToken(usuario) {
  return jwt.sign(
    {
      sub: usuario.id,
      tipo: 'access',
      username: usuario.username,
      email: usuario.email,
      categoria: usuario.categoria,
      pesquisador_id: usuario.pesquisador_id
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

export function gerarRefreshToken(usuario) {
  return jwt.sign({ sub: usuario.id, tipo: 'refresh' }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn
  });
}

export function verificarRefreshToken(token) {
  try {
    const payload = jwt.verify(token, env.jwt.refreshSecret);
    if (payload.tipo !== 'refresh') throw new Error('tipo inválido');
    return payload;
  } catch {
    throw ApiError.unauthorized('Refresh token inválido ou expirado.');
  }
}

export function gerarParDeTokens(usuario) {
  return {
    accessToken: gerarAccessToken(usuario),
    refreshToken: gerarRefreshToken(usuario),
    expiresIn: env.jwt.expiresIn
  };
}
