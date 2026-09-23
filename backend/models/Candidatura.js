/**
 * Candidaturas dos alunos às vagas (tabela `candidaturas`).
 *
 * Não existe no DER. O aluno se candidata pelo site, sem conta de acesso:
 * informa nome, matrícula e e-mail acadêmico. O mesmo e-mail ou a mesma
 * matrícula não se candidatam duas vezes à mesma vaga.
 *
 * Diferente das tabelas do DER, guarda `criado_em`: a ordem de chegada
 * importa para quem vai avaliar as candidaturas.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Candidatura = sequelize.define(
  'Candidatura',
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
        notEmpty: { msg: 'O nome é obrigatório.' },
        len: { args: [3, 100], msg: 'O nome deve ter entre 3 e 100 caracteres.' }
      }
    },
    matricula: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'A matrícula é obrigatória.' }
      }
    },
    email: {
      // e-mail acadêmico (institucional) do aluno
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O e-mail acadêmico é obrigatório.' },
        isEmail: { msg: 'E-mail inválido.' }
      }
    },
    vagas_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  },
  {
    tableName: 'candidaturas',
    // data de envio da candidatura; não há edição, então sem updatedAt
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['vagas_id', 'email'], name: 'candidaturas_vaga_email' },
      { unique: true, fields: ['vagas_id', 'matricula'], name: 'candidaturas_vaga_matricula' }
    ],
    hooks: {
      beforeValidate(candidatura) {
        if (candidatura.nome) candidatura.nome = candidatura.nome.trim();
        if (candidatura.matricula) candidatura.matricula = candidatura.matricula.trim();
        if (candidatura.email) candidatura.email = candidatura.email.trim().toLowerCase();
      }
    }
  }
);

export default Candidatura;
