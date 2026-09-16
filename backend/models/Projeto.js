/**
 * Projetos de pesquisa e extensão (tabela `projetos` do DER).
 *
 * OBSERVAÇÃO SOBRE O DER: no diagrama `projetos.id` é INT AUTO_INCREMENT.
 * Aqui ele é UUID, para ficar uniforme com as demais tabelas do sistema.
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
      type: DataTypes.STRING(45),
      allowNull: false,
      validate: { notEmpty: { msg: 'O título do projeto é obrigatório.' } }
    },
    resumo: {
      type: DataTypes.STRING(45),
      allowNull: true
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
