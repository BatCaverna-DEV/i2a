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
 *
 * Usa describeTable/addColumn e consultas tipadas: com o conector MariaDB
 * falando com um MySQL 8, uma consulta crua de SHOW quebra no Sequelize.
 */
import { DataTypes, QueryTypes } from 'sequelize';

import { sequelize } from '../models/index.js';

try {
  await sequelize.authenticate();
  console.log('[db] conectado');

  const qi = sequelize.getQueryInterface();
  const colunas = await qi.describeTable('projetos');

  if (colunas.ano) {
    console.log('[ano] coluna projetos.ano já existe');
  } else {
    await qi.addColumn('projetos', 'ano', { type: DataTypes.INTEGER, allowNull: true });
    console.log('[ano] coluna projetos.ano criada (vazia)');
  }

  const [{ total, sem_ano: semAno }] = await sequelize.query(
    'SELECT COUNT(*) AS total, SUM(ano IS NULL) AS sem_ano FROM projetos',
    { type: QueryTypes.SELECT }
  );
  console.log(`[ano] projetos: ${total}; sem ano preenchido: ${semAno ?? 0}`);
  console.log('\n[ano] concluído. Reinicie a API.');
} catch (error) {
  console.error('[ano] falhou:', error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
