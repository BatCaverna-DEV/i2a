/**
 * Credenciais de acesso à área administrativa (tabela `usuarios` do DER).
 *
 * OBSERVAÇÃO SOBRE O DER: o diagrama original traz apenas
 * id, username, categoria, status e pesquisador_id. Como o sistema exige
 * autenticação JWT com Google Authenticator, três colunas foram acrescentadas:
 *   - senha_hash    -> hash bcrypt da senha
 *   - totp_secret   -> segredo base32 do Google Authenticator
 *   - totp_ativo    -> se o segundo fator já foi confirmado pelo usuário
 * Elas nunca são devolvidas pela API (ver o `defaultScope` abaixo).
 */
import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';

/** Categorias possíveis do usuário (coluna `categoria`). */
export const CATEGORIA_USUARIO = Object.freeze({
  ADMIN: 1, // acesso total
  COORDENADOR: 2, // gerencia projetos, cursos e pesquisadores
  PESQUISADOR: 3 // gerencia apenas os próprios registros
});

/** Situações possíveis do usuário (coluna `status`). */
export const STATUS_USUARIO = Object.freeze({
  INATIVO: 0,
  ATIVO: 1,
  BLOQUEADO: 2
});

const Usuario = sequelize.define(
  'Usuario',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: { msg: 'Já existe um usuário com esse nome.' },
      validate: {
        notEmpty: { msg: 'O nome de usuário é obrigatório.' },
        len: { args: [3, 100], msg: 'O nome de usuário deve ter ao menos 3 caracteres.' }
      }
    },
    senha_hash: {
      type: DataTypes.STRING(60), // bcrypt gera sempre 60 caracteres
      allowNull: false
    },
    totp_secret: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    totp_ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    categoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: CATEGORIA_USUARIO.PESQUISADOR,
      validate: {
        isIn: {
          args: [Object.values(CATEGORIA_USUARIO)],
          msg: 'Categoria inválida.'
        }
      }
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: STATUS_USUARIO.ATIVO,
      validate: {
        isIn: { args: [Object.values(STATUS_USUARIO)], msg: 'Situação inválida.' }
      }
    },
    pesquisador_id: {
      type: DataTypes.UUID,
      allowNull: true
    }
  },
  {
    tableName: 'usuarios',
    defaultScope: {
      attributes: { exclude: ['senha_hash', 'totp_secret'] }
    },
    scopes: {
      // usado apenas pelo fluxo de login
      comCredenciais: { attributes: { include: ['senha_hash', 'totp_secret'] } }
    },
    hooks: {
      beforeValidate(usuario) {
        if (usuario.username) usuario.username = usuario.username.trim().toLowerCase();
      }
    }
  }
);

/** Define a senha já aplicando o hash bcrypt. */
Usuario.prototype.definirSenha = async function definirSenha(senhaPura) {
  this.senha_hash = await bcrypt.hash(senhaPura, 10);
};

/** Compara uma senha em texto puro com o hash armazenado. */
Usuario.prototype.verificarSenha = function verificarSenha(senhaPura) {
  if (!this.senha_hash) return Promise.resolve(false);
  return bcrypt.compare(senhaPura, this.senha_hash);
};

/** Remove os campos sensíveis de qualquer serialização do model. */
Usuario.prototype.toJSON = function toJSON() {
  const valores = { ...this.get() };
  delete valores.senha_hash;
  delete valores.totp_secret;
  return valores;
};

export default Usuario;
