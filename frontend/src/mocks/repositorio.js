/**
 * Repositório em memória que imita o comportamento da API:
 * paginação, busca por texto, filtros e CRUD.
 *
 * As alterações valem enquanto a aba estiver aberta — recarregar volta ao
 * estado inicial. Isso é proposital: são dados de demonstração.
 */

/** Pequeno atraso para que os estados de carregamento apareçam de verdade. */
export function atraso(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function novoId() {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Envelope idêntico ao que o backend devolve nas listagens. */
export function paginar(itens, { page = 1, limit = 20 } = {}) {
  const pagina = Math.max(1, Number(page) || 1);
  const porPagina = Math.max(1, Number(limit) || 20);
  const inicio = (pagina - 1) * porPagina;

  return {
    data: itens.slice(inicio, inicio + porPagina),
    meta: {
      total: itens.length,
      page: pagina,
      limit: porPagina,
      totalPages: Math.max(1, Math.ceil(itens.length / porPagina))
    }
  };
}

function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function filtrar(itens, params = {}, { camposBusca = [], filtros = [] } = {}) {
  let resultado = [...itens];

  if (params.q && camposBusca.length) {
    const alvo = normalizar(params.q);
    resultado = resultado.filter((item) =>
      camposBusca.some((campo) => normalizar(item[campo]).includes(alvo))
    );
  }

  for (const campo of filtros) {
    const valor = params[campo];
    if (valor === undefined || valor === null || valor === '') continue;
    resultado = resultado.filter((item) => String(item[campo]) === String(valor));
  }

  return resultado;
}

/**
 * Cria um CRUD em memória com a mesma assinatura dos serviços de `adminService`.
 *
 * @param {Array}  colecao   array de origem (é copiado, o original não muda)
 * @param {Object} opcoes    { camposBusca, filtros, ordenar }
 */
export function criarRepositorio(colecao, { camposBusca = [], filtros = [], ordenar } = {}) {
  const itens = colecao.map((item) => ({ ...item }));

  return {
    async listar(params = {}) {
      await atraso();
      let resultado = filtrar(itens, params, { camposBusca, filtros });
      if (ordenar) resultado.sort(ordenar);
      return paginar(resultado, params);
    },

    async buscar(id) {
      await atraso();
      const item = itens.find((i) => i.id === id);
      if (!item) throw new Error('Registro não encontrado.');
      return { ...item };
    },

    async criar(payload) {
      await atraso();
      const novo = { ...payload, id: novoId() };
      itens.unshift(novo);
      return { ...novo };
    },

    async atualizar(id, payload) {
      await atraso();
      const indice = itens.findIndex((i) => i.id === id);
      if (indice < 0) throw new Error('Registro não encontrado.');
      itens[indice] = { ...itens[indice], ...payload };
      return { ...itens[indice] };
    },

    async remover(id) {
      await atraso();
      const indice = itens.findIndex((i) => i.id === id);
      if (indice < 0) throw new Error('Registro não encontrado.');
      itens.splice(indice, 1);
    },

    /** acesso direto, usado por consultas que cruzam coleções */
    todos: () => itens
  };
}
