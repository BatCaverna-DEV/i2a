/**
 * Dados de exemplo no MESMO formato que a API devolve.
 *
 * São fictícios e servem apenas para desenvolver as telas antes da integração.
 * Quando `VITE_USE_MOCKS=false`, nada daqui é carregado.
 *
 * Os IDs são UUIDs fixos (e não gerados) para que os links entre as páginas
 * continuem válidos a cada recarregamento.
 */

/* ----------------------------- linhas ----------------------------- */
export const linhas = [
  {
    id: '11111111-1111-4111-8111-000000000001',
    descricao: 'Aprendizagem de Máquina e Aprendizagem Profunda',
    total_pesquisadores: 4
  },
  {
    id: '11111111-1111-4111-8111-000000000002',
    descricao: 'Inteligência Artificial Aplicada à Saúde',
    total_pesquisadores: 3
  },
  {
    id: '11111111-1111-4111-8111-000000000003',
    descricao: 'Visão Computacional e Sensoriamento Remoto',
    total_pesquisadores: 2
  },
  {
    id: '11111111-1111-4111-8111-000000000004',
    descricao: 'Processamento de Linguagem Natural',
    total_pesquisadores: 2
  },
  {
    id: '11111111-1111-4111-8111-000000000005',
    descricao: 'Ciência de Dados e Otimização',
    total_pesquisadores: 1
  }
];

const linha = (n) => linhas.find((l) => l.descricao.startsWith(n));

/* -------------------------- pesquisadores ------------------------- */
export const pesquisadores = [
  {
    id: '22222222-2222-4222-8222-000000000001',
    nome: 'Bruno Vicente',
    email: 'bruno.vicente@ifma.edu.br',
    matricula: '1234567',
    linhas_id: linhas[0].id,
    linha: linhas[0],
    papel: 'Coordenador',
    resumo:
      'Doutor em Engenharia Elétrica e de Computação. Pesquisa aprendizagem semissupervisionada, deep learning e teoria da informação.',
    lattes: 'http://lattes.cnpq.br/0000000000000000',
    titulacoes: [
      { titulo: 'Doutorado em Engenharia Elétrica e de Computação', instituicao: 'UFRN', ano: 2021 },
      { titulo: 'Mestrado em Ciência da Computação', instituicao: 'UFMA', ano: 2015 }
    ]
  },
  {
    id: '22222222-2222-4222-8222-000000000002',
    nome: 'Ana Carolina Lima',
    email: 'ana.lima@ifma.edu.br',
    matricula: '2234567',
    linhas_id: linhas[1].id,
    linha: linhas[1],
    papel: 'Pesquisadora',
    resumo: 'Aplicações de aprendizado de máquina em dados clínicos e apoio ao diagnóstico.',
    lattes: 'http://lattes.cnpq.br/0000000000000001',
    titulacoes: [
      { titulo: 'Doutorado em Ciência da Computação', instituicao: 'UFPE', ano: 2020 }
    ]
  },
  {
    id: '22222222-2222-4222-8222-000000000003',
    nome: 'Carlos Eduardo Mendes',
    email: 'carlos.mendes@ifma.edu.br',
    matricula: '3234567',
    linhas_id: linhas[2].id,
    linha: linhas[2],
    papel: 'Pesquisador',
    resumo: 'Visão computacional aplicada a imagens de satélite e monitoramento ambiental.',
    lattes: 'http://lattes.cnpq.br/0000000000000002',
    titulacoes: [{ titulo: 'Doutorado em Sensoriamento Remoto', instituicao: 'INPE', ano: 2019 }]
  },
  {
    id: '22222222-2222-4222-8222-000000000004',
    nome: 'Daniela Sousa Rocha',
    email: 'daniela.rocha@ifma.edu.br',
    matricula: '4234567',
    linhas_id: linhas[3].id,
    linha: linhas[3],
    papel: 'Pesquisadora',
    resumo: 'Processamento de linguagem natural para o português e modelos de linguagem.',
    lattes: 'http://lattes.cnpq.br/0000000000000003',
    titulacoes: [{ titulo: 'Mestrado em Ciência da Computação', instituicao: 'UFMA', ano: 2018 }]
  },
  {
    id: '22222222-2222-4222-8222-000000000005',
    nome: 'Eduardo Ferreira Lopes',
    email: 'eduardo.lopes@ifma.edu.br',
    matricula: '5234567',
    linhas_id: linhas[0].id,
    linha: linhas[0],
    papel: 'Estudante de IC',
    resumo: 'Bolsista de iniciação científica em redes neurais profundas.',
    lattes: 'http://lattes.cnpq.br/0000000000000004',
    titulacoes: []
  },
  {
    id: '22222222-2222-4222-8222-000000000006',
    nome: 'Fernanda Alves Pires',
    email: 'fernanda.pires@ifma.edu.br',
    matricula: '6234567',
    linhas_id: linhas[4].id,
    linha: linhas[4],
    papel: 'Pesquisadora',
    resumo: 'Otimização combinatória e ciência de dados aplicada a problemas logísticos.',
    lattes: 'http://lattes.cnpq.br/0000000000000005',
    titulacoes: [{ titulo: 'Doutorado em Engenharia de Produção', instituicao: 'UFSC', ano: 2017 }]
  }
];

const p = (i) => {
  const { id, nome } = pesquisadores[i];
  return { id, nome };
};

/* ---------------------------- projetos ---------------------------- */
export const projetos = [
  {
    id: '33333333-3333-4333-8333-000000000001',
    titulo: 'Detecção precoce de doenças crônicas',
    resumo: 'Modelos preditivos sobre prontuários eletrônicos da rede municipal.',
    status: 1,
    tipo: 1,
    pesquisador_id: pesquisadores[1].id,
    coordenador: p(1),
    equipe: [p(1), p(0), p(4)]
  },
  {
    id: '33333333-3333-4333-8333-000000000002',
    titulo: 'Mapeamento do uso do solo no MATOPIBA',
    resumo: 'Classificação de séries temporais de imagens de satélite.',
    status: 1,
    tipo: 1,
    pesquisador_id: pesquisadores[2].id,
    coordenador: p(2),
    equipe: [p(2), p(0)]
  },
  {
    id: '33333333-3333-4333-8333-000000000003',
    titulo: 'IA na escola: formação docente',
    resumo: 'Oficinas de pensamento computacional e IA para professores da rede.',
    status: 1,
    tipo: 2,
    pesquisador_id: pesquisadores[3].id,
    coordenador: p(3),
    equipe: [p(3), p(5)]
  },
  {
    id: '33333333-3333-4333-8333-000000000004',
    titulo: 'Corpus do português maranhense',
    resumo: 'Construção de corpus anotado para tarefas de PLN regionais.',
    status: 2,
    tipo: 1,
    pesquisador_id: pesquisadores[3].id,
    coordenador: p(3),
    equipe: [p(3)]
  },
  {
    id: '33333333-3333-4333-8333-000000000005',
    titulo: 'Otimização de rotas da merenda escolar',
    resumo: 'Heurísticas para distribuição em municípios do interior.',
    status: 0,
    tipo: 3,
    pesquisador_id: pesquisadores[5].id,
    coordenador: p(5),
    equipe: [p(5)]
  },
  {
    id: '33333333-3333-4333-8333-000000000006',
    titulo: 'Aprendizagem semissupervisionada em stream',
    resumo: 'Rotulagem automática para fluxos contínuos de dados.',
    status: 1,
    tipo: 1,
    pesquisador_id: pesquisadores[0].id,
    coordenador: p(0),
    equipe: [p(0), p(4)]
  }
];

/* ----------------------------- cursos ----------------------------- */
const dias = (n) => new Date(Date.now() + n * 86_400_000).toISOString();

export const cursos = [
  {
    id: '44444444-4444-4444-8444-000000000001',
    titulo: 'Introdução ao Python para dados',
    resumo: 'Curso introdutório, 20h, aberto à comunidade.',
    inicio: dias(30),
    inscricoes_inicio: dias(-5),
    inscricoes_fim: dias(20),
    pesquisador_id: pesquisadores[0].id,
    responsavel: { ...p(0), email: pesquisadores[0].email }
  },
  {
    id: '44444444-4444-4444-8444-000000000002',
    titulo: 'Redes neurais na prática',
    resumo: 'Minicurso de 12h com PyTorch.',
    inicio: dias(45),
    inscricoes_inicio: dias(-2),
    inscricoes_fim: dias(25),
    pesquisador_id: pesquisadores[4].id,
    responsavel: { ...p(4), email: pesquisadores[4].email }
  },
  {
    id: '44444444-4444-4444-8444-000000000003',
    titulo: 'Visão computacional com OpenCV',
    resumo: 'Oficina de 8h para estudantes do ADS.',
    inicio: dias(-40),
    inscricoes_inicio: dias(-70),
    inscricoes_fim: dias(-45),
    pesquisador_id: pesquisadores[2].id,
    responsavel: { ...p(2), email: pesquisadores[2].email }
  },
  {
    id: '44444444-4444-4444-8444-000000000004',
    titulo: 'PLN para o português',
    resumo: 'Curso de 16h sobre modelos de linguagem.',
    inicio: dias(60),
    inscricoes_inicio: dias(10),
    inscricoes_fim: dias(50),
    pesquisador_id: pesquisadores[3].id,
    responsavel: { ...p(3), email: pesquisadores[3].email }
  }
];

/* ---------------------------- produções --------------------------- */
export const producoes = [
  {
    id: '55555555-5555-4555-8555-000000000001',
    titulo: 'Deep self-labeled learning',
    ano: 2025,
    veiculo: 'Knowledge-Based Systems',
    tipo: 1,
    doi: '10.1016/j.knosys.2025.000000',
    qualis: 'A1',
    volume: '298',
    paginas: '1-18',
    issn_isbn: '0950-7051',
    url: null,
    autores: [p(0), p(1)]
  },
  {
    id: '55555555-5555-4555-8555-000000000002',
    titulo: 'Séries temporais de satélite no cerrado',
    ano: 2025,
    veiculo: 'Remote Sensing Letters',
    tipo: 1,
    doi: '10.1080/rsl.2025.000000',
    qualis: 'A2',
    volume: '16',
    paginas: '220-236',
    issn_isbn: '2150-704X',
    url: null,
    autores: [p(2), p(0)]
  },
  {
    id: '55555555-5555-4555-8555-000000000003',
    titulo: 'Triagem clínica assistida por IA',
    ano: 2024,
    veiculo: 'SBC — Simpósio Brasileiro de Computação Aplicada à Saúde',
    tipo: 2,
    doi: null,
    qualis: 'B1',
    volume: null,
    paginas: '45-56',
    issn_isbn: null,
    url: 'https://sol.sbc.org.br/',
    autores: [p(1)]
  },
  {
    id: '55555555-5555-4555-8555-000000000004',
    titulo: 'Corpus anotado do português maranhense',
    ano: 2024,
    veiculo: 'STIL — Symposium in Information and Human Language Technology',
    tipo: 2,
    doi: null,
    qualis: 'B2',
    volume: null,
    paginas: '112-121',
    issn_isbn: null,
    url: null,
    autores: [p(3), p(4)]
  },
  {
    id: '55555555-5555-4555-8555-000000000005',
    titulo: 'Heurísticas para roteirização escolar',
    ano: 2023,
    veiculo: 'Pesquisa Operacional',
    tipo: 1,
    doi: '10.1590/0101-7438.2023.000000',
    qualis: 'B1',
    volume: '43',
    paginas: '1-20',
    issn_isbn: '0101-7438',
    url: null,
    autores: [p(5)]
  },
  {
    id: '55555555-5555-4555-8555-000000000006',
    titulo: 'Ensino de IA na educação básica',
    ano: 2023,
    veiculo: 'Editora IFMA',
    tipo: 3,
    doi: null,
    qualis: null,
    volume: null,
    paginas: '77-98',
    issn_isbn: '978-85-0000-000-0',
    url: null,
    autores: [p(3), p(0)]
  },
  {
    id: '55555555-5555-4555-8555-000000000007',
    titulo: 'Biblioteca DSL para rotulagem automática',
    ano: 2022,
    veiculo: 'Registro de software',
    tipo: 7,
    doi: null,
    qualis: null,
    volume: null,
    paginas: null,
    issn_isbn: null,
    url: 'https://github.com/',
    autores: [p(0)]
  }
];

/* ---------------------------- titulações -------------------------- */
export const titulacoes = pesquisadores.flatMap((pesq, i) =>
  (pesq.titulacoes ?? []).map((t, j) => ({
    id: `66666666-6666-4666-8666-${String(i)}${String(j)}0000000${i}${j}`.slice(0, 36),
    ...t,
    pesquisador_id: pesq.id,
    pesquisador: { id: pesq.id, nome: pesq.nome }
  }))
);

/* ----------------------------- usuários --------------------------- */
export const usuarios = [
  {
    id: '77777777-7777-4777-8777-000000000001',
    username: 'admin',
    email: pesquisadores[0].email,
    categoria: 1,
    status: 1,
    ultimo_acesso: new Date().toISOString(),
    pesquisador_id: pesquisadores[0].id,
    pesquisador: { ...p(0), email: pesquisadores[0].email }
  },
  {
    id: '77777777-7777-4777-8777-000000000002',
    username: 'ana.lima',
    email: pesquisadores[1].email,
    categoria: 2,
    status: 1,
    ultimo_acesso: new Date().toISOString(),
    pesquisador_id: pesquisadores[1].id,
    pesquisador: { ...p(1), email: pesquisadores[1].email }
  },
  {
    id: '77777777-7777-4777-8777-000000000003',
    username: 'eduardo.lopes',
    email: pesquisadores[4].email,
    categoria: 3,
    status: 0,
    ultimo_acesso: null,
    pesquisador_id: pesquisadores[4].id,
    pesquisador: { ...p(4), email: pesquisadores[4].email }
  }
];

/* ---------------------- oportunidades abertas --------------------- */
/** Ainda não existe no DER — ver as sugestões em sistema.md. */
export const oportunidades = [
  {
    id: 'op-1',
    titulo: 'Bolsa de Iniciação Científica (PIBIC)',
    nivel: 'Graduação',
    linha: 'Aprendizagem de Máquina e Aprendizagem Profunda',
    vagas: 2,
    prazo: dias(25),
    requisitos: 'Estar matriculado no ADS, ter cursado Estrutura de Dados e noções de Python.',
    contato: 'bruno.vicente@ifma.edu.br'
  },
  {
    id: 'op-2',
    titulo: 'Iniciação em Desenvolvimento Tecnológico (PIBIT)',
    nivel: 'Graduação',
    linha: 'Visão Computacional e Sensoriamento Remoto',
    vagas: 1,
    prazo: dias(40),
    requisitos: 'Interesse em processamento de imagens; desejável experiência com Git.',
    contato: 'carlos.mendes@ifma.edu.br'
  },
  {
    id: 'op-3',
    titulo: 'Voluntariado em pesquisa',
    nivel: 'Graduação',
    linha: 'Processamento de Linguagem Natural',
    vagas: 3,
    prazo: null,
    requisitos: 'Disponibilidade de 8h semanais. Fluxo contínuo, sem prazo de inscrição.',
    contato: 'daniela.rocha@ifma.edu.br'
  }
];
