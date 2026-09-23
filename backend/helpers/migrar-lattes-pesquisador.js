/**
 * Migração: coluna `lattes` (link do currículo Lattes) na tabela `pesquisador`.
 *
 * O `sync` sem --alter não acrescenta colunas em tabelas que já existem, por
 * isso este script cria a coluna quando ela falta. Ela nasce vazia (NULL):
 * o link de cada pesquisador é preenchido depois, pelo painel.
 *
 * Uso:
 *   npm run db:lattes
 *
 * Rode ANTES de reiniciar a API com o código novo — o model já pede a coluna
 * e as consultas de pesquisadores falhariam sem ela. Pode ser rodado mais de
 * uma vez.
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
  const colunas = await qi.describeTable('pesquisador');

  if (colunas.lattes) {
    console.log('[lattes] coluna pesquisador.lattes já existe');
  } else {
    await qi.addColumn('pesquisador', 'lattes', { type: DataTypes.STRING(255), allowNull: true });
    console.log('[lattes] coluna pesquisador.lattes criada (vazia)');
  }

  const [{ total, sem_lattes: semLattes }] = await sequelize.query(
    'SELECT COUNT(*) AS total, SUM(lattes IS NULL) AS sem_lattes FROM pesquisador',
    { type: QueryTypes.SELECT }
  );
  console.log(`[lattes] pesquisadores: ${total}; sem link preenchido: ${semLattes ?? 0}`);
  console.log('\n[lattes] concluído. Reinicie a API.');
} catch (error) {
  console.error('[lattes] falhou:', error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
