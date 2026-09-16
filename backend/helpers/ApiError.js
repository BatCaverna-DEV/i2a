/** Erro de aplicação com código HTTP — capturado pelo errorHandler. */
export default class ApiError extends Error {
  constructor(status, message, detalhes = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detalhes = detalhes;
  }

  static badRequest(msg = 'Requisição inválida.', detalhes) {
    return new ApiError(400, msg, detalhes);
  }

  static unauthorized(msg = 'Credenciais inválidas ou ausentes.') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Você não tem permissão para esta operação.') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Registro não encontrado.') {
    return new ApiError(404, msg);
  }

  static conflict(msg = 'Registro já existente.') {
    return new ApiError(409, msg);
  }
}
