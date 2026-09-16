/**
 * Valida req.body (ou req.query) contra um schema Zod antes de chegar ao controller.
 * Uso: router.post('/', validate(criarPesquisadorSchema), controller.criar)
 */
import ApiError from './ApiError.js';

export default function validate(schema, origem = 'body') {
  return function middleware(req, res, next) {
    const resultado = schema.safeParse(req[origem]);
    if (!resultado.success) {
      const detalhes = resultado.error.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensagem: issue.message
      }));
      return next(ApiError.badRequest('Dados inválidos.', detalhes));
    }
    req[origem] = resultado.data;
    next();
  };
}
