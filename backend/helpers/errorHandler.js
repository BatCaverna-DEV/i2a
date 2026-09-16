import env from '../config/env.js';
import ApiError from './ApiError.js';

/** Rota inexistente dentro do prefixo da API. */
export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

/** Middleware final de erro — sempre devolve JSON no mesmo formato. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // erros de validação/unicidade do Sequelize viram 400/409
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      erro: 'Dados inválidos.',
      detalhes: err.errors.map((e) => ({ campo: e.path, mensagem: e.message }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      erro: 'Já existe um registro com esses dados.',
      detalhes: err.errors.map((e) => ({ campo: e.path, mensagem: e.message }))
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({
      erro: 'Operação viola um vínculo com outro registro.'
    });
  }

  const status = err instanceof ApiError ? err.status : 500;
  const mensagem = status === 500 && env.isProduction ? 'Erro interno do servidor.' : err.message;

  if (status === 500) {
    console.error('[erro]', err);
  }

  res.status(status).json({
    erro: mensagem,
    ...(err.detalhes ? { detalhes: err.detalhes } : {}),
    ...(env.isProduction ? {} : { stack: err.stack })
  });
}
