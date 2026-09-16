/**
 * Regras de negócio da autenticação.
 *
 * Fluxo completo:
 *   1. o navegador obtém um ID token do Google;
 *   2. a API valida esse token (helpers/googleService.js);
 *   3. procura o e-mail na tabela `usuarios` — só entra quem foi pré-cadastrado;
 *   4. vincula o `google_sub` no primeiro acesso;
 *   5. emite o par de tokens JWT da própria aplicação.
 *
 * Não existe senha em lugar nenhum do sistema.
 */
import ApiError from './ApiError.js';
import { Usuario, Pesquisador, STATUS_USUARIO } from '../models/index.js';
import { verificarIdToken } from './googleService.js';
import * as tokens from './tokenService.js';

/** Formato do usuário devolvido ao frontend. */
export function publicarUsuario(usuario) {
  const { id, username, email, nome, avatar_url, categoria, status, pesquisador_id } = usuario;
  return {
    id,
    username,
    email,
    nome: nome ?? username,
    avatar_url,
    categoria,
    status,
    pesquisador_id,
    pesquisador: usuario.pesquisador
      ? {
          id: usuario.pesquisador.id,
          nome: usuario.pesquisador.nome,
          email: usuario.pesquisador.email
        }
      : null
  };
}

/**
 * Entrada com conta Google.
 * @param {string} credential ID token vindo do Google Identity Services
 */
export async function entrarComGoogle(credential) {
  const perfil = await verificarIdToken(credential);

  const usuario = await Usuario.scope('completo').findOne({
    where: { email: perfil.email },
    include: [{ model: Pesquisador, as: 'pesquisador' }]
  });

  // Acesso restrito: a conta Google precisa ter sido cadastrada antes.
  if (!usuario) {
    throw ApiError.forbidden(
      `A conta ${perfil.email} não está autorizada a acessar a área administrativa. ` +
        'Peça a um administrador do grupo para cadastrá-la.'
    );
  }

  if (usuario.status !== STATUS_USUARIO.ATIVO) {
    throw ApiError.forbidden('Usuário inativo ou bloqueado. Procure a coordenação do grupo.');
  }

  // Um e-mail já vinculado a outra conta Google indica troca de titular:
  // bloqueia em vez de deixar passar silenciosamente.
  if (usuario.google_sub && usuario.google_sub !== perfil.sub) {
    throw ApiError.forbidden(
      'Este e-mail já está vinculado a outra conta Google. Procure um administrador.'
    );
  }

  // primeiro acesso (ou atualização do perfil)
  usuario.google_sub = perfil.sub;
  usuario.nome = perfil.nome;
  usuario.avatar_url = perfil.avatar;
  usuario.ultimo_acesso = new Date();
  await usuario.save();

  return {
    usuario: publicarUsuario(usuario),
    ...tokens.gerarParDeTokens(usuario)
  };
}

/** Renova o access token a partir de um refresh token válido. */
export async function renovar(refreshToken) {
  const payload = tokens.verificarRefreshToken(refreshToken);

  const usuario = await Usuario.findByPk(payload.sub);
  if (!usuario || usuario.status !== STATUS_USUARIO.ATIVO) {
    throw ApiError.unauthorized('Usuário indisponível.');
  }

  return tokens.gerarParDeTokens(usuario);
}

/**
 * Desvincula a conta Google atual. No próximo login o vínculo é refeito —
 * útil quando alguém troca de conta Google mantendo o mesmo e-mail cadastrado.
 */
export async function desvincularGoogle(usuarioId) {
  const usuario = await Usuario.scope('completo').findByPk(usuarioId);
  if (!usuario) throw ApiError.notFound('Usuário não encontrado.');

  usuario.google_sub = null;
  await usuario.save();
}
