/** Linhas de pesquisa do grupo (tabela `linhas` do DER). */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Linha = sequelize.define(
  'Linha',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    descricao: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'A descrição da linha é obrigatória.' },
        len: { args: [3, 100], msg: 'A descrição deve ter entre 3 e 100 caracteres.' }
      }
    }
  },
  { tableName: 'linhas' }
);

export default Linha;
