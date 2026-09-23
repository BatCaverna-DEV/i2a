/**
 * Migração: coluna `ano` (ano de início) na tabela `projetos`.
 *
 * O `sync` sem --alter não acrescenta colunas em tabelas que já existem, por
 * isso este script cria a coluna quando ela falta. Ela nasce vazia (NULL):
 * o ano dos projetos já cadastrados é preenchido depois, pelo painel.
 *
 * Uso:
 *   npm run db:ano-projeto
 *
 * Rode ANTES de reiniciar a API com o código novo — o model já pede a coluna
 * e as consultas de projetos falhariam sem ela. Pode ser rodado mais de uma vez.
 */
import { sequelize } from '../models/index.js';

try {
  await sequelize.authenticate();
  console.log('[db] conectado');

  const [colunas] = await sequelize.query("SHOW COLUMNS FROM projetos LIKE 'ano'");
  if (colunas.length > 0) {
    console.log('[ano] coluna projetos.ano já existe');
  } else {
    await sequelize.query('ALTER TABLE projetos ADD COLUMN ano INT NULL AFTER resumo');
    console.log('[ano] coluna projetos.ano criada (vazia)');
  }

  const [[{ total, sem_ano: semAno }]] = await sequelize.query(
    'SELECT COUNT(*) AS total, SUM(ano IS NULL) AS sem_ano FROM projetos'
  );
  console.log(`[ano] projetos: ${total}; sem ano preenchido: ${semAno ?? 0}`);
  console.log('\n[ano] concluído. Reinicie a API.');
} catch (error) {
  console.error('[ano] falhou:', error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
