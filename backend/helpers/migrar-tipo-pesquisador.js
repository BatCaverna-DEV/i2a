/**
 * Migração: coluna `tipo` na tabela `pesquisador`.
 *
 *   1 Pesquisador · 2 Aluno (orientando)
 *
 * O `sync` sem --alter não acrescenta colunas em tabelas que já existem, por
 * isso este script:
 *   1. cria a coluna, se ainda não existir (padrão 1 = Pesquisador);
 *   2. marca como Aluno (2) quem tem conta de acesso do tipo Orientando.
 *
 * Uso:
 *   npm run db:tipo
 *
 * Pode ser rodado mais de uma vez: a coluna só é criada se faltar, e o passo 2
 * só promove orientandos a Aluno — nunca rebaixa ninguém a Pesquisador.
 */
import { QueryTypes } from 'sequelize';

import {
  sequelize,
  CATEGORIA_USUARIO,
  TIPO_PESQUISADOR,
  ROTULO_TIPO_PESQUISADOR
} from '../models/index.js';

async function criarColuna() {
  // describeTable em vez de SHOW cru: com o conector MariaDB falando com um
  // MySQL 8, consulta crua de SHOW quebra no Sequelize
  const colunas = await sequelize.getQueryInterface().describeTable('pesquisador');
  if (colunas.tipo) {
    console.log('[tipo] coluna pesquisador.tipo já existe');
    return;
  }

  await sequelize.query(
    `ALTER TABLE pesquisador
       ADD COLUMN tipo TINYINT NOT NULL DEFAULT ${TIPO_PESQUISADOR.PESQUISADOR} AFTER matricula`
  );
  console.log('[tipo] coluna pesquisador.tipo criada (padrão 1 = Pesquisador)');
}

async function marcarAlunos() {
  const [, info] = await sequelize.query(
    `UPDATE pesquisador p
       JOIN usuarios u ON u.pesquisador_id = p.id
        SET p.tipo = :aluno
      WHERE u.categoria = :orientando AND p.tipo <> :aluno`,
    {
      replacements: {
        aluno: TIPO_PESQUISADOR.ALUNO,
        orientando: CATEGORIA_USUARIO.ORIENTANDO
      }
    }
  );
  console.log(`[tipo] orientandos marcados como Aluno: ${info?.affectedRows ?? 0}`);
}

try {
  await sequelize.authenticate();
  console.log('[db] conectado');

  await criarColuna();
  await marcarAlunos();

  const final = await sequelize.query(
    'SELECT tipo, COUNT(*) AS total FROM pesquisador GROUP BY tipo ORDER BY tipo',
    { type: QueryTypes.SELECT }
  );
  console.log('\n[tipo] situação final:');
  console.table(final.map((l) => ({ ...l, rotulo: ROTULO_TIPO_PESQUISADOR[l.tipo] ?? '?' })));

  console.log('\n[tipo] concluído. Reinicie o servidor.');
} catch (error) {
  console.error('[tipo] falhou:', error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
