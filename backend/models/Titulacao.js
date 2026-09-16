/** Titulações acadêmicas de um pesquisador (tabela `titulacao` do DER). */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ANO_MAXIMO = new Date().getFullYear() + 1;

const Titulacao = sequelize.define(
  'Titulacao',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    titulo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: { msg: 'O título é obrigatório.' } }
    },
    instituicao: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: { msg: 'A instituição é obrigatória.' } }
    },
    ano: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: { args: [1900], msg: 'Ano inválido.' },
        max: { args: [ANO_MAXIMO], msg: `O ano não pode ser posterior a ${ANO_MAXIMO}.` }
      }
    },
    pesquisador_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  },
  {
    tableName: 'titulacao',
    indexes: [{ fields: ['pesquisador_id'] }]
  }
);

export default Titulacao;
