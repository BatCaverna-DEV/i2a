/**
 * Tabela associativa entre pesquisadores e projetos (tabela `orientacacoes`
 * do DER — o nome da tabela mantém a grafia original do diagrama).
 * Representa os pesquisadores que orientam/participam de cada projeto.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Orientacao = sequelize.define(
  'Orientacao',
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
    projetos_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  },
  {
    tableName: 'orientacacoes',
    indexes: [
      {
        name: 'orientacacoes_pesquisador_projeto_unico',
        unique: true,
        fields: ['pesquisador_id', 'projetos_id']
      }
    ]
  }
);

export default Orientacao;
