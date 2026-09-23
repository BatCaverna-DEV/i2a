/**
 * Implementação falsa da API, com as mesmas assinaturas dos services reais.
 * Importado apenas quando `VITE_USE_MOCKS=true` (ver src/config.js).
 */
import * as dados from './dados.js';
import { criarRepositorio, paginar, filtrar, atraso } from './repositorio.js';

/**
 * Vincula a cada pesquisador de exemplo a conta de acesso correspondente,
 * do mesmo jeito que a API faz no include de `usuarios`.
 */
const pesquisadoresComConta = dados.pesquisadores.map((p) => ({
  ...p,
  usuarios: dados.usuarios.filter((u) => u.pesquisador_id === p.id)
}));

/* ------------------------- repositórios --------------------------- */
const repo = {
  linhas: criarRepositorio(dados.linhas, {
    camposBusca: ['descricao'],
    ordenar: (a, b) => a.descricao.localeCompare(b.descricao)
  }),
  pesquisadores: criarRepositorio(pesquisadoresComConta, {
    camposBusca: ['nome', 'email', 'matricula'],
    filtros: ['linhas_id', 'tipo'],
    ordenar: (a, b) => a.nome.localeCompare(b.nome)
  }),
  projetos: criarRepositorio(dados.projetos, {
    camposBusca: ['titulo', 'resumo'],
    filtros: ['status', 'tipo', 'ano', 'pesquisador_id'],
    ordenar: (a, b) => a.titulo.localeCompare(b.titulo)
  }),
  cursos: criarRepositorio(dados.cursos, {
    camposBusca: ['titulo', 'resumo'],
    filtros: ['pesquisador_id'],
    ordenar: (a, b) => new Date(b.inicio ?? 0) - new Date(a.inicio ?? 0)
  }),
  producoes: criarRepositorio(dados.producoes, {
    camposBusca: ['titulo', 'veiculo', 'doi'],
    filtros: ['ano', 'tipo', 'qualis'],
    ordenar: (a, b) => (b.ano ?? 0) - (a.ano ?? 0) || a.titulo.localeCompare(b.titulo)
  }),
  titulacoes: criarRepositorio(dados.titulacoes, {
    camposBusca: ['titulo', 'instituicao'],
    filtros: ['pesquisador_id', 'ano'],
    ordenar: (a, b) => (b.ano ?? 0) - (a.ano ?? 0)
  }),
  usuarios: criarRepositorio(dados.usuarios, {
    camposBusca: ['username', 'email'],
    ordenar: (a, b) => a.username.localeCompare(b.username)
  })
};

/** { id, nome } do pesquisador, no formato dos includes da API. */
function resumoPesquisador(id) {
  const pesq = repo.pesquisadores.todos().find((p) => p.id === id);
  return pesq ? { id: pesq.id, nome: pesq.nome } : null;
}

/**
 * Espelha a sincronização da API: os orientandos da equipe passam a ser
 * exatamente `ids`; os demais membros continuam.
 */
function aplicarOrientandos(equipe, ids) {
  const ehOrientando = (id) =>
    repo.usuarios.todos().some((u) => u.pesquisador_id === id && u.categoria === 3);
  const mantidos = equipe.filter((m) => !ehOrientando(m.id));
  const novos = [...new Set(ids)].map(resumoPesquisador).filter(Boolean);
  return [...mantidos, ...novos];
}

/** Espelha a API: quem tem conta de Administrador não conta como pesquisador. */
function ehAdministrador(pesquisadorId) {
  return dados.usuarios.some((u) => u.pesquisador_id === pesquisadorId && u.categoria === 1);
}
const pesquisadoresContados = () => dados.pesquisadores.filter((p) => !ehAdministrador(p.id));

function inscricoesAbertas(curso) {
  if (!curso.inscricoes_inicio || !curso.inscricoes_fim) return false;
  const agora = Date.now();
  return (
    agora >= new Date(curso.inscricoes_inicio).getTime() &&
    agora <= new Date(curso.inscricoes_fim).getTime()
  );
}

/* --------------------------- rotas públicas ----------------------- */
export const publico = {
  async estatisticas() {
    await atraso();
    const porAno = {};
    for (const prod of dados.producoes) {
      if (prod.ano) porAno[prod.ano] = (porAno[prod.ano] ?? 0) + 1;
    }
    return {
      totalPesquisadores: pesquisadoresContados().length,
      totalProjetos: dados.projetos.length,
      totalCursos: dados.cursos.length,
      totalProducoes: dados.producoes.length,
      totalLinhas: dados.linhas.length,
      producaoPorAno: Object.entries(porAno)
        .map(([ano, total]) => ({ ano: Number(ano), total }))
        .sort((a, b) => a.ano - b.ano)
    };
  },

  async linhas() {
    await atraso();
    const contados = pesquisadoresContados();
    return {
      data: dados.linhas
        .map((l) => ({
          ...l,
          total_pesquisadores: contados.filter((p) => p.linhas_id === l.id).length
        }))
        .sort((a, b) => a.descricao.localeCompare(b.descricao))
    };
  },

  async pesquisadores(params = {}) {
    await atraso();
    const alvo = params.linha ? { linhas_id: params.linha, q: params.q, tipo: params.tipo } : params;
    // mesma regra da API: sem administradores, pesquisadores antes de alunos
    const lista = filtrar(pesquisadoresContados(), alvo, {
      camposBusca: ['nome'],
      filtros: ['linhas_id', 'tipo']
    }).sort((a, b) => (a.tipo ?? 1) - (b.tipo ?? 1) || a.nome.localeCompare(b.nome));
    return paginar(lista, { page: params.page, limit: params.limit ?? 24 });
  },

  async pesquisador(id) {
    await atraso();
    const pesq = dados.pesquisadores.find((x) => x.id === id);
    if (!pesq) throw new Error('Pesquisador não encontrado.');
    return {
      ...pesq,
      projetos: dados.projetos.filter((pr) => pr.equipe.some((m) => m.id === id)),
      producoes: dados.producoes.filter((pd) => pd.autores.some((a) => a.id === id)),
      cursos: dados.cursos.filter((c) => c.pesquisador_id === id)
    };
  },

  async projetos(params = {}) {
    await atraso();
    const lista = filtrar(dados.projetos, params, { filtros: ['status', 'tipo', 'ano'] })
      .filter((pr) => (params.status === undefined ? pr.status !== 0 : true))
      .sort((a, b) => a.titulo.localeCompare(b.titulo));
    return paginar(lista, { page: params.page, limit: params.limit ?? 12 });
  },

  async projeto(id) {
    await atraso();
    const pr = dados.projetos.find((x) => x.id === id);
    if (!pr) throw new Error('Projeto não encontrado.');
    return { ...pr };
  },

  async cursos(params = {}) {
    await atraso();
    let lista = [...dados.cursos];
    if (params.abertos === '1') lista = lista.filter(inscricoesAbertas);
    lista.sort((a, b) => new Date(b.inicio ?? 0) - new Date(a.inicio ?? 0));
    return paginar(lista, { page: params.page, limit: params.limit ?? 12 });
  },

  async curso(id) {
    await atraso();
    const c = dados.cursos.find((x) => x.id === id);
    if (!c) throw new Error('Curso não encontrado.');
    return { ...c };
  },

  async producoes(params = {}) {
    await atraso();
    const lista = filtrar(dados.producoes, params, {
      camposBusca: ['titulo', 'veiculo'],
      filtros: ['ano', 'tipo']
    }).sort((a, b) => (b.ano ?? 0) - (a.ano ?? 0) || a.titulo.localeCompare(b.titulo));
    return paginar(lista, { page: params.page, limit: params.limit ?? 20 });
  },

  async oportunidades() {
    await atraso();
    return { data: [...dados.oportunidades] };
  }
};

/* ------------------------ rotas administrativas ------------------- */
export const admin = {
  linhas: repo.linhas,
  titulacoes: repo.titulacoes,
  cursos: repo.cursos,

  pesquisadores: {
    ...repo.pesquisadores,
    completo: (id) => publico.pesquisador(id),

    /** Espelha o ?categoria= da API (tipo da conta de acesso). */
    async listar(params = {}) {
      const { categoria, ...resto } = params;
      if (!categoria) return repo.pesquisadores.listar(resto);
      const todos = await repo.pesquisadores.listar({ ...resto, page: 1, limit: 10_000 });
      const lista = todos.data.filter((p) =>
        (p.usuarios ?? []).some((u) => u.categoria === Number(categoria))
      );
      return paginar(lista, resto);
    },

    /** Espelha o backend: cadastrar pesquisador cria a conta de acesso junto. */
    async criar(payload) {
      const { categoria = 3, ...dadosPesquisador } = payload;
      // mesmo padrão da API: sem tipo explícito, Orientando vira Aluno (2)
      const pesquisador = await repo.pesquisadores.criar({
        ...dadosPesquisador,
        tipo: dadosPesquisador.tipo ?? (categoria === 3 ? 2 : 1)
      });

      const conta = await repo.usuarios.criar({
        username: String(payload.email ?? '').split('@')[0],
        email: payload.email,
        nome: payload.nome,
        categoria,
        status: 1,
        ultimo_acesso: null,
        pesquisador_id: pesquisador.id
      });

      return repo.pesquisadores.atualizar(pesquisador.id, { usuarios: [conta] });
    },

    async atualizar(id, payload) {
      const { categoria, ...dadosPesquisador } = payload;
      const atual = await repo.pesquisadores.buscar(id);
      const conta = atual.usuarios?.[0];

      if (conta && categoria !== undefined) {
        await repo.usuarios.atualizar(conta.id, { categoria, email: payload.email });
        return repo.pesquisadores.atualizar(id, {
          ...dadosPesquisador,
          usuarios: [{ ...conta, categoria, email: payload.email }]
        });
      }
      return repo.pesquisadores.atualizar(id, dadosPesquisador);
    }
  },

  projetos: {
    ...repo.projetos,

    async criar(payload) {
      const { orientandos, ...dadosProjeto } = payload;
      return repo.projetos.criar({
        ...dadosProjeto,
        coordenador: resumoPesquisador(dadosProjeto.pesquisador_id),
        equipe: aplicarOrientandos([], orientandos ?? [])
      });
    },

    async atualizar(id, payload) {
      const { orientandos, ...dadosProjeto } = payload;
      const atual = await repo.projetos.buscar(id);
      return repo.projetos.atualizar(id, {
        ...dadosProjeto,
        coordenador: resumoPesquisador(dadosProjeto.pesquisador_id ?? atual.pesquisador_id),
        ...(orientandos && { equipe: aplicarOrientandos(atual.equipe ?? [], orientandos) })
      });
    },

    async adicionarMembro(id, pesquisador_id) {
      const projeto = await repo.projetos.buscar(id);
      const pesq = dados.pesquisadores.find((x) => x.id === pesquisador_id);
      const equipe = [...projeto.equipe];
      if (pesq && !equipe.some((m) => m.id === pesq.id)) {
        equipe.push({ id: pesq.id, nome: pesq.nome });
      }
      return repo.projetos.atualizar(id, { equipe });
    },
    async removerMembro(id, pesquisadorId) {
      const projeto = await repo.projetos.buscar(id);
      return repo.projetos.atualizar(id, {
        equipe: projeto.equipe.filter((m) => m.id !== pesquisadorId)
      });
    }
  },

  producoes: {
    ...repo.producoes,
    async adicionarAutor(id, pesquisador_id) {
      const producao = await repo.producoes.buscar(id);
      const pesq = dados.pesquisadores.find((x) => x.id === pesquisador_id);
      const autores = [...producao.autores];
      if (pesq && !autores.some((a) => a.id === pesq.id)) {
        autores.push({ id: pesq.id, nome: pesq.nome });
      }
      return repo.producoes.atualizar(id, { autores });
    },
    async removerAutor(id, pesquisadorId) {
      const producao = await repo.producoes.buscar(id);
      return repo.producoes.atualizar(id, {
        autores: producao.autores.filter((a) => a.id !== pesquisadorId)
      });
    }
  },

  usuarios: {
    ...repo.usuarios,
    async desvincular(id) {
      await repo.usuarios.atualizar(id, { ultimo_acesso: null });
      return { mensagem: 'Conta Google desvinculada.' };
    }
  }
};

/* --------------------------- autenticação ------------------------- */
const USUARIO_DEMO = {
  ...dados.usuarios[0],
  nome: dados.pesquisadores[0].nome,
  avatar_url: null,
  pesquisador: {
    id: dados.pesquisadores[0].id,
    nome: dados.pesquisadores[0].nome,
    email: dados.pesquisadores[0].email
  }
};

export const auth = {
  /**
   * No modo de demonstração o botão devolve um token falso e qualquer
   * "clique" entra como o administrador de exemplo. Serve só para percorrer
   * as telas do painel sem o backend e sem Client ID do Google.
   */
  async google() {
    await atraso(500);
    return {
      usuario: USUARIO_DEMO,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: '2h'
    };
  },

  async eu() {
    await atraso(120);
    return USUARIO_DEMO;
  },

  async desvincular() {
    await atraso(200);
    return { mensagem: 'Conta Google desvinculada (demonstração).' };
  }
};
