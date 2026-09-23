/** Limitadores de requisição para as rotas sensíveis (autenticação e formulários públicos). */
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente em alguns minutos.' }
});

export const totpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de verificação. Aguarde alguns minutos.' }
});

/** Formulário público de candidatura: barra envio em massa vindo do mesmo IP. */
export const candidaturaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas candidaturas enviadas. Tente novamente mais tarde.' }
});
