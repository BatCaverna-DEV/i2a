/**
 * Prepara o banco de dados do Grupo I2A:
 *   1. conecta no MariaDB;
 *   2. cria as tabelas a partir dos models (com as chaves estrangeiras);
 *   3. popula os dados mínimos para o sistema funcionar
 *      (linhas de pesquisa, um pesquisador e o usuário administrador).
 *
 * Uso:
 *   npm run db                    cria o que falta e popula
 *   npm run db -- --alter         ajusta colunas de tabelas que já existem
 *   npm run db -- --force         APAGA e recria tudo (só em desenvolvimento)
 *   npm run db -- --tabelas       só cria as tabelas, sem popular
 *                                 (use para criar vagas/candidaturas num banco existente)
 *
 * O script é idempotente: rodar duas vezes sem --force não duplica nada.
 */
import env from '../config/env.js';
import {
  sequelize,
  Linha,
  Pesquisador,
  Usuario,
  CATEGORIA_USUARIO,
  STATUS_USUARIO
} from '../models/index.js';

const force = process.argv.includes('--force');
const alter = process.argv.includes('--alter');
const somenteTabelas = process.argv.includes('--tabelas');

/** Linhas de pesquisa criadas no primeiro uso. */
const LINHAS_PADRAO = [
  'Aprendizagem de Máquina e Aprendizagem Profunda',
  'Inteligência Artificial Aplicada à Saúde',
  'Visão Computacional e Sensoriamento Remoto',
  'Processamento de Linguagem Natural',
  'Ciência de Dados e Otimização'
];

/** Ordem de criação: respeita as dependências entre as chaves estrangeiras. */
const ORDEM_DAS_TABELAS = [
  'Linha',
  'Pesquisador',
  'Usuario',
  'Titulacao',
  'Curso',
  'Projeto',
  'Orientacao',
  'Producao',
  'Autor',
  'Vaga',
  'Candidatura'
];

async function criarTabelas() {
  if (force) {
    console.warn('[db] --force: TODAS as tabelas serão apagadas e recriadas.');
    if (env.isProduction) {
      throw new Error('--force é proibido com NODE_ENV=production.');
    }
    // derruba na ordem inversa para não esbarrar nas chaves estrangeiras
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const nome of [...ORDEM_DAS_TABELAS].reverse()) {
      await sequelize.models[nome].drop();
    }
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  }

  for (const nome of ORDEM_DAS_TABELAS) {
    const model = sequelize.models[nome];
    await model.sync({ alter });
    console.log(`[db] tabela "${model.tableName}" pronta`);
  }
}

async function popular() {
  // --- linhas de pesquisa ---
  let novasLinhas = 0;
  for (const descricao of LINHAS_PADRAO) {
    const [, criada] = await Linha.findOrCreate({ where: { descricao }, defaults: { descricao } });
    if (criada) novasLinhas += 1;
  }
  console.log(`[seed] linhas de pesquisa: ${LINHAS_PADRAO.length} garantidas (${novasLinhas} novas)`);

  // --- pesquisador do administrador ---
  const email = env.seed.email.trim().toLowerCase();
  const [pesquisador, pesquisadorCriado] = await Pesquisador.findOrCreate({
    where: { email },
    defaults: { nome: env.seed.nome, email }
  });
  console.log(
    `[seed] pesquisador "${pesquisador.nome}" ${pesquisadorCriado ? 'criado' : 'já existia'}`
  );

  // --- usuário administrador ---
  const username = env.seed.username.trim().toLowerCase();
  const existente = await Usuario.findOne({ where: { username } });

  if (existente) {
    console.log(`[seed] usuário "${username}" já existe — vínculo com o Google preservado`);
    return;
  }

  await Usuario.create({
    username,
    email,
    categoria: CATEGORIA_USUARIO.ADMINISTRADOR,
    status: STATUS_USUARIO.ATIVO,
    pesquisador_id: pesquisador.id
  });

  console.log(`[seed] usuário administrador "${username}" criado para ${email}`);
  console.log('[seed] entre em /admin/login com essa conta Google');
}

try {
  await sequelize.authenticate();
  console.log(`[db] conectado em ${env.db.host}:${env.db.port}/${env.db.name}`);

  await criarTabelas();

  if (somenteTabelas) {
    console.log('[db] --tabelas: dados iniciais não foram inseridos');
  } else {
    await popular();
  }

  console.log('[db] concluído com sucesso');
} catch (error) {
  console.error('[db] falhou:', error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
