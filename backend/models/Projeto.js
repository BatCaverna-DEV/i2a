/**
 * Projetos de pesquisa e extensão (tabela `projetos` do DER).
 *
 * OBSERVAÇÕES SOBRE O DER:
 *  - no diagrama `projetos.id` é INT AUTO_INCREMENT; aqui é UUID, para ficar
 *    uniforme com as demais tabelas;
 *  - `titulo` e `resumo` eram VARCHAR(45). Quarenta e cinco caracteres não
 *    cabem nem um título de projeto, então viraram VARCHAR(255) e TEXT;
 *  - `ano` (ano de início) não existe no DER. É opcional porque os projetos
 *    cadastrados antes dele não têm o dado.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/** Situação do projeto (coluna `status`). */
export const STATUS_PROJETO = Object.freeze({
  EM_ELABORACAO: 0,
  EM_ANDAMENTO: 1,
  CONCLUIDO: 2,
  CANCELADO: 3
});

/** Natureza do projeto (coluna `tipo`). */
export const TIPO_PROJETO = Object.freeze({
  PESQUISA: 1,
  EXTENSAO: 2,
  DESENVOLVIMENTO: 3,
  ENSINO: 4
});

const Projeto = sequelize.define(
  'Projeto',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    titulo: {
      // o DER previa VARCHAR(45), curto demais para um título de projeto
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O título do projeto é obrigatório.' },
        len: { args: [5, 255], msg: 'O título deve ter entre 5 e 255 caracteres.' }
      }
    },
    resumo: {
      // TEXT: até ~65 mil caracteres, suficiente para o resumo inteiro
      type: DataTypes.TEXT,
      allowNull: true
    },
    ano: {
      // ano de início do projeto
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: 'Ano inválido.' },
        min: { args: [1900], msg: 'Ano inválido.' },
        max: { args: [2100], msg: 'Ano inválido.' }
      }
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: STATUS_PROJETO.EM_ELABORACAO,
      validate: {
        isIn: { args: [Object.values(STATUS_PROJETO)], msg: 'Situação de projeto inválida.' }
      }
    },
    tipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: TIPO_PROJETO.PESQUISA,
      validate: {
        isIn: { args: [Object.values(TIPO_PROJETO)], msg: 'Tipo de projeto inválido.' }
      }
    },
    pesquisador_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'coordenador do projeto'
    }
  },
  {
    tableName: 'projetos',
    indexes: [{ fields: ['pesquisador_id'] }, { fields: ['status'] }]
  }
);

export default Projeto;
