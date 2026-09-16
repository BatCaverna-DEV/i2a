/**
 * Migração da tabela `usuarios`: autenticação por senha/TOTP → conta Google.
 *
 * Roda uma vez, num banco que já existe, PRESERVANDO os dados. Ela:
 *   1. acrescenta email, google_sub, nome, avatar_url e ultimo_acesso;
 *   2. preenche o e-mail de cada usuário a partir do pesquisador vinculado;
 *   3. torna o e-mail obrigatório e único, e cria o índice de google_sub;
 *   4. remove senha_hash, totp_secret e totp_ativo;
 *   5. garante que exista um administrador ativo com o e-mail informado.
 *
 * Uso:
 *   npm run db:google
 *   npm run db:google -- --admin=seu.email@ifma.edu.br
 *
 * O `--admin` cadastra (ou promove a administrador ativo) a conta Google
 * informada. Sem ele, usa SEED_ADMIN_EMAIL do .env.
 *
 * É idempotente: rodar de novo não quebra nada.
 * Se preferir recomeçar do zero e perder os dados, use `npm run db -- --force`.
 */
import env from '../config/env.js';
import { sequelize, Usuario, Pesquisador, CATEGORIA_USUARIO, STATUS_USUARIO } from '../models/index.js';

const argumentoAdmin = process.argv.find((a) => a.startsWith('--admin='));
const emailAdmin = (argumentoAdmin?.split('=')[1] ?? env.seed.email).trim().toLowerCase();

const TABELA = 'usuarios';

async function colunas() {
  const [linhas] = await sequelize.query(
    `SELECT COLUMN_NAME AS nome FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${TABELA}'`
  );
  return linhas.map((l) => l.nome);
}

async function indices() {
  const [linhas] = await sequelize.query(
    `SELECT DISTINCT INDEX_NAME AS nome FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${TABELA}'`
  );
  return linhas.map((l) => l.nome);
}

async function passo1_acrescentarColunas() {
  const existentes = await colunas();

  const novas = [
    ['email', 'VARCHAR(150) NULL'],
    ['google_sub', 'VARCHAR(64) NULL'],
    ['nome', 'VARCHAR(150) NULL'],
    ['avatar_url', 'VARCHAR(400) NULL'],
    ['ultimo_acesso', 'DATETIME NULL']
  ];

  for (const [nome, tipo] of novas) {
    if (existentes.includes(nome)) {
      console.log(`[migrar] coluna "${nome}" já existe`);
      continue;
    }
    await sequelize.query(`ALTER TABLE \`${TABELA}\` ADD COLUMN \`${nome}\` ${tipo}`);
    console.log(`[migrar] coluna "${nome}" criada`);
  }
}

async function passo2_preencherEmails() {
  // herda o e-mail do pesquisador vinculado, quando houver
  const [resultado] = await sequelize.query(`
    UPDATE \`${TABELA}\` u
      JOIN pesquisador p ON u.pesquisador_id = p.id
       SET u.email = LOWER(TRIM(p.email))
     WHERE (u.email IS NULL OR u.email = '') AND p.email IS NOT NULL
  `);
  console.log('[migrar] e-mails herdados do pesquisador vinculado');

  // quem ficou sem e-mail recebe um endereço inválido de propósito:
  // nenhuma conta Google consegue usá-lo, então o acesso fica bloqueado
  // até um administrador corrigir pelo painel.
  const [semEmail] = await sequelize.query(
    `SELECT id, username FROM \`${TABELA}\` WHERE email IS NULL OR email = ''`
  );

  for (const linha of semEmail) {
    await sequelize.query(
      `UPDATE \`${TABELA}\` SET email = :email WHERE id = :id`,
      { replacements: { email: `${linha.username}@sem-email.invalido`, id: linha.id } }
    );
    console.warn(
      `[migrar] AVISO: "${linha.username}" não tinha e-mail — recebeu um endereço ` +
        'inválido e NÃO conseguirá entrar até ser corrigido no painel.'
    );
  }
}

async function passo3_restricoes() {
  await sequelize.query(`ALTER TABLE \`${TABELA}\` MODIFY \`email\` VARCHAR(150) NOT NULL`);
  console.log('[migrar] e-mail agora é obrigatório');

  const existentes = await indices();

  if (!existentes.includes('usuarios_email_unico')) {
    await sequelize.query(
      `ALTER TABLE \`${TABELA}\` ADD UNIQUE INDEX \`usuarios_email_unico\` (\`email\`)`
    );
    console.log('[migrar] índice único de e-mail criado');
  }

  if (!existentes.includes('usuarios_google_sub_unico')) {
    await sequelize.query(
      `ALTER TABLE \`${TABELA}\` ADD UNIQUE INDEX \`usuarios_google_sub_unico\` (\`google_sub\`)`
    );
    console.log('[migrar] índice único de google_sub criado');
  }
}

async function passo4_removerColunasAntigas() {
  const existentes = await colunas();

  for (const nome of ['senha_hash', 'totp_secret', 'totp_ativo']) {
    if (!existentes.includes(nome)) continue;
    await sequelize.query(`ALTER TABLE \`${TABELA}\` DROP COLUMN \`${nome}\``);
    console.log(`[migrar] coluna "${nome}" removida`);
  }
}

async function passo5_garantirAdministrador() {
  const existente = await Usuario.findOne({ where: { email: emailAdmin } });

  if (existente) {
    existente.categoria = CATEGORIA_USUARIO.ADMINISTRADOR;
    existente.status = STATUS_USUARIO.ATIVO;
    await existente.save();
    console.log(`[migrar] "${emailAdmin}" confirmado como administrador ativo`);
    return;
  }

  const [pesquisador] = await Pesquisador.findOrCreate({
    where: { email: emailAdmin },
    defaults: { nome: env.seed.nome, email: emailAdmin }
  });

  // username derivado do e-mail, sem colidir com os existentes
  let username = emailAdmin.split('@')[0].toLowerCase();
  let sufixo = 1;
  while (await Usuario.findOne({ where: { username } })) {
    username = `${emailAdmin.split('@')[0].toLowerCase()}${++sufixo}`;
  }

  await Usuario.create({
    username,
    email: emailAdmin,
    categoria: CATEGORIA_USUARIO.ADMINISTRADOR,
    status: STATUS_USUARIO.ATIVO,
    pesquisador_id: pesquisador.id
  });
  console.log(`[migrar] administrador "${username}" criado para ${emailAdmin}`);
}

try {
  await sequelize.authenticate();
  console.log(`[db] conectado em ${env.db.host}:${env.db.port}/${env.db.name}`);

  await passo1_acrescentarColunas();
  await passo2_preencherEmails();
  await passo3_restricoes();
  await passo4_removerColunasAntigas();
  await passo5_garantirAdministrador();

  const [final] = await sequelize.query(
    `SELECT username, email, categoria, status FROM \`${TABELA}\` ORDER BY username`
  );
  console.log('\n[migrar] situação final da tabela usuarios:');
  console.table(final);

  console.log('\n[migrar] concluído. Reinicie o servidor e tente entrar novamente.');
} catch (error) {
  console.error('[migrar] falhou:', error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
