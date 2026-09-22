/** Traduz ?page e ?limit da query string em offset/limit do Sequelize. */
export function parsePaginacao(query, { limitePadrao = 20, limiteMaximo = 100 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const limit = Math.min(limiteMaximo, Math.max(1, Number.parseInt(query.limit ?? limitePadrao, 10) || limitePadrao));
  return { page, limit, offset: (page - 1) * limit };
}

/** Monta o envelope padrão de resposta paginada da API. */
export function montarResposta({ rows, count, page, limit }) {
  return {
    data: rows,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(count / limit))
    }
  };
}
