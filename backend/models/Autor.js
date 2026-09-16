/**
 * Tabela associativa entre pesquisadores e produções (tabela `autores` do DER).
 * Uma produção tem vários autores; um pesquisador tem várias produções.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Autor = sequelize.define(
  'Autor',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    pesquisador_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    producao_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    ordem: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'posição do autor na citação (1 = primeiro autor)'
    }
  },
  {
    tableName: 'autores',
    indexes: [
      {
        name: 'autores_pesquisador_producao_unico',
        unique: true,
        fields: ['pesquisador_id', 'producao_id']
      }
    ]
  }
);

export default Autor;
