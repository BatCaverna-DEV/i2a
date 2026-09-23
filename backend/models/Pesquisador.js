/** Pesquisadores do grupo (tabela `pesquisador` do DER). */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Tipo do membro do grupo (coluna `tipo`).
 *
 *  1 PESQUISADOR — docente/pesquisador
 *  2 ALUNO       — estudante orientado (orientando)
 *
 * Não confundir com `usuarios.categoria`, que define o que a conta pode
 * fazer no painel. Ao cadastrar, o tipo segue a categoria: Orientando → Aluno.
 */
export const TIPO_PESQUISADOR = Object.freeze({
  PESQUISADOR: 1,
  ALUNO: 2
});

export const ROTULO_TIPO_PESQUISADOR = Object.freeze({
  [1]: 'Pesquisador',
  [2]: 'Aluno'
});

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
    lattes: {
      // link do currículo na Plataforma Lattes (ex.: http://lattes.cnpq.br/1234567890123456)
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: { args: { protocols: ['http', 'https'], require_protocol: true }, msg: 'Link do Lattes inválido.' }
      }
    },
    tipo: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: TIPO_PESQUISADOR.PESQUISADOR,
      validate: {
        isIn: { args: [Object.values(TIPO_PESQUISADOR)], msg: 'Tipo de pesquisador inválido.' }
      }
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
