/**
 * Migração dos papéis de usuário e das contas de acesso.
 *
 * O que mudou:
 *   ANTES  1 Administrador · 2 Coordenador · 3 Pesquisador
 *   AGORA  1 Administrador · 2 Pesquisador · 3 Orientando
 *
 * O valor 3 trocou de significado. Quem era "Pesquisador" (3) precisa virar 2,
 * senão seria rebaixado a Orientando — um perfil de somente leitura — sem que
 * ninguém tivesse pedido isso.
 *
 * A migração também garante que todo pesquisador tenha uma conta de acesso,
 * já que agora cadastro de pesquisador e criação de usuário andam juntos.
 *
 * Uso:
 *   npm run db:papeis                 remapeia e cria as contas que faltam
 *   npm run db:papeis -- --sem-remapear   só cria as contas, sem mexer nos papéis
 *
 * Rode UMA VEZ. O remapeamento não é idempotente por natureza: se houver
 * orientandos de verdade no banco, use --sem-remapear.
 */
import {
  sequelize,
  Usuario,
  Pesquisador,
  CATEGORIA_USUARIO,
  ROTULO_CATEGORIA,
  STATUS_USUARIO
} from '../models/index.js';

const semRemapear = process.argv.includes('--sem-remapear');

async function remapearCategorias() {
  if (semRemapear) {
    console.log('[papeis] --sem-remapear: categorias mantidas como estão');
    return;
  }

  const [antes] = await sequelize.query(
    'SELECT categoria, COUNT(*) AS total FROM usuarios GROUP BY categoria ORDER BY categoria'
  );
  console.log('[papeis] distribuição atual:', antes);

  // 3 (antigo Pesquisador) → 2 (Pesquisador). O 2 antigo era Coordenador e
  // continua fazendo sentido como Pesquisador, então não precisa mudar.
  const [, info] = await sequelize.query(
    'UPDATE usuarios SET categoria = 2 WHERE categoria = 3'
  );
  console.log(`[papeis] usuários promovidos de 3 para 2: ${info?.affectedRows ?? 0}`);
}

async function criarContasFaltantes() {
  const pesquisadores = await Pesquisador.findAll({ include: [{ model: Usuario, as: 'usuarios' }] });

  let criadas = 0;
  let semEmail = 0;

  for (const pesquisador of pesquisadores) {
    if (pesquisador.usuarios?.length) continue;

    if (!pesquisador.email) {
      console.warn(`[papeis] AVISO: "${pesquisador.nome}" não tem e-mail — conta não criada.`);
      semEmail += 1;
      continue;
    }

    const email = pesquisador.email.trim().toLowerCase();

    // o e-mail pode já estar em uso por uma conta ainda não vinculada
    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      existente.pesquisador_id = pesquisador.id;
      await existente.save();
      console.log(`[papeis] conta "${existente.username}" vinculada a ${pesquisador.nome}`);
      continue;
    }

    let username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'usuario';
    let sufixo = 1;
    const base = username;
    while (await Usuario.findOne({ where: { username } })) username = `${base}${++sufixo}`;

    await Usuario.create({
      username,
      email,
      nome: pesquisador.nome,
      categoria: CATEGORIA_USUARIO.PESQUISADOR,
      status: STATUS_USUARIO.ATIVO,
      pesquisador_id: pesquisador.id
    });
    criadas += 1;
    console.log(`[papeis] conta criada para ${pesquisador.nome} (${email})`);
  }

  console.log(`[papeis] contas criadas: ${criadas}; pesquisadores sem e-mail: ${semEmail}`);
}

try {
  await sequelize.authenticate();
  console.log('[db] conectado');

  await remapearCategorias();
  await criarContasFaltantes();

  const [final] = await sequelize.query(
    'SELECT username, email, categoria, status FROM usuarios ORDER BY categoria, username'
  );
  console.log('\n[papeis] situação final:');
  console.table(
    final.map((u) => ({ ...u, perfil: ROTULO_CATEGORIA[u.categoria] ?? '?' }))
  );

  console.log('\n[papeis] concluído. Reinicie o servidor.');
} catch (error) {
  console.error('[papeis] falhou:', error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
