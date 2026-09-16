/**
 * Implementação falsa da API, com as mesmas assinaturas dos services reais.
 * Importado apenas quando `VITE_USE_MOCKS=true` (ver src/config.js).
 */
import * as dados from './dados.js';
import { criarRepositorio, paginar, filtrar, atraso } from './repositorio.js';

/* ------------------------- repositórios --------------------------- */
const repo = {
  linhas: criarRepositorio(dados.linhas, {
    camposBusca: ['descricao'],
    ordenar: (a, b) => a.descricao.localeCompare(b.descricao)
  }),
  pesquisadores: criarRepositorio(dados.pesquisadores, {
    camposBusca: ['nome', 'email', 'matricula'],
    filtros: ['linhas_id'],
    ordenar: (a, b) => a.nome.localeCompare(b.nome)
  }),
  projetos: criarRepositorio(dados.projetos, {
    camposBusca: ['titulo', 'resumo'],
    filtros: ['status', 'tipo', 'pesquisador_id'],
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
    camposBusca: ['username'],
    ordenar: (a, b) => a.username.localeCompare(b.username)
  })
};

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
      totalPesquisadores: dados.pesquisadores.length,
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
    return { data: [...dados.linhas].sort((a, b) => a.descricao.localeCompare(b.descricao)) };
  },

  async pesquisadores(params = {}) {
    await atraso();
    const alvo = params.linha ? { linhas_id: params.linha, q: params.q } : params;
    const lista = filtrar(dados.pesquisadores, alvo, {
      camposBusca: ['nome'],
      filtros: ['linhas_id']
    }).sort((a, b) => a.nome.localeCompare(b.nome));
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
    const lista = filtrar(dados.projetos, params, { filtros: ['status', 'tipo'] })
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
    completo: (id) => publico.pesquisador(id)
  },

  projetos: {
    ...repo.projetos,
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
    async reiniciar2fa(id) {
      await repo.usuarios.atualizar(id, { totp_ativo: false });
      return { mensagem: 'Segundo fator reiniciado para este usuário.' };
    }
  }
};

/* --------------------------- autenticação ------------------------- */
const USUARIO_DEMO = {
  ...dados.usuarios[0],
  pesquisador: {
    id: dados.pesquisadores[0].id,
    nome: dados.pesquisadores[0].nome,
    email: dados.pesquisadores[0].email
  }
};

export const auth = {
  /**
   * No modo de demonstração qualquer usuário/senha é aceito e qualquer
   * código de 6 dígitos passa. Serve só para percorrer as telas do painel.
   */
  async login(username) {
    await atraso(400);
    return {
      etapa: 'verificar-2fa',
      mfaToken: 'mock-mfa-token',
      mensagem: `Modo demonstração: qualquer código de 6 dígitos entra como "${username}".`
    };
  },

  async verificar() {
    await atraso(400);
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

  async trocarSenha() {
    await atraso(300);
    return { mensagem: 'Senha alterada com sucesso (demonstração).' };
  },

  async qrcode2fa() {
    await atraso(200);
    return { qrCode: '', ativo: true };
  },

  async reiniciar2fa() {
    await atraso(200);
    return { mensagem: 'Segundo fator removido (demonstração).' };
  }
};
