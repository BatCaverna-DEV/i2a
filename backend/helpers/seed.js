/**
 * Popula o banco com dados mínimos para o sistema funcionar:
 * linhas de pesquisa, um pesquisador e o usuário administrador inicial.
 * Uso: npm run db:seed
 */
import env from '../config/env.js';
import {
  sequelize,
  Linha,
  Pesquisador,
  Usuario
} from '../models/index.js';
import { CATEGORIA_USUARIO, STATUS_USUARIO } from '../models/Usuario.js';

const LINHAS_PADRAO = [
  'Aprendizagem de Máquina e Aprendizagem Profunda',
  'Inteligência Artificial Aplicada à Saúde',
  'Visão Computacional e Sensoriamento Remoto',
  'Processamento de Linguagem Natural',
  'Ciência de Dados e Otimização'
];

try {
  await sequelize.authenticate();
  await sequelize.sync();

  for (const descricao of LINHAS_PADRAO) {
    await Linha.findOrCreate({ where: { descricao }, defaults: { descricao } });
  }
  console.log(`[seed] ${LINHAS_PADRAO.length} linhas de pesquisa garantidas`);

  const [pesquisador] = await Pesquisador.findOrCreate({
    where: { email: env.seed.email },
    defaults: { nome: env.seed.nome, email: env.seed.email }
  });
  console.log(`[seed] pesquisador "${pesquisador.nome}" garantido`);

  const existente = await Usuario.findOne({ where: { username: env.seed.username } });
  if (existente) {
    console.log(`[seed] usuário "${env.seed.username}" já existe — nada a fazer`);
  } else {
    const usuario = Usuario.build({
      username: env.seed.username,
      categoria: CATEGORIA_USUARIO.ADMIN,
      status: STATUS_USUARIO.ATIVO,
      pesquisador_id: pesquisador.id
    });
    await usuario.definirSenha(env.seed.password);
    await usuario.save();

    console.log(`[seed] usuário administrador "${env.seed.username}" criado`);
    console.log('[seed] no primeiro login a API devolve o QR Code do Google Authenticator');
  }
} catch (error) {
  console.error('[seed] falhou:', error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
