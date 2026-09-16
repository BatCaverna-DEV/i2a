/** Pesquisadores do grupo (tabela `pesquisador` do DER). */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Pesquisador = sequelize.define(
  'Pesquisador',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O nome do pesquisador é obrigatório.' },
        len: { args: [3, 100], msg: 'O nome deve ter entre 3 e 100 caracteres.' }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: { msg: 'Já existe um pesquisador com esse e-mail.' },
      validate: {
        notEmpty: { msg: 'O e-mail é obrigatório.' },
        isEmail: { msg: 'E-mail inválido.' }
      }
    },
    matricula: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    linhas_id: {
      type: DataTypes.UUID,
      allowNull: true
    }
  },
  {
    tableName: 'pesquisador',
    hooks: {
      // normaliza o e-mail para evitar duplicatas que diferem só no caixa
      beforeValidate(pesquisador) {
        if (pesquisador.email) pesquisador.email = pesquisador.email.trim().toLowerCase();
        if (pesquisador.nome) pesquisador.nome = pesquisador.nome.trim();
      }
    }
  }
);

export default Pesquisador;
