/**
 * Contas com acesso à área administrativa (tabela `usuarios` do DER).
 *
 * A autenticação é feita exclusivamente por conta Google — o sistema não
 * armazena senha nenhuma. O que identifica o usuário é o `google_sub`
 * (identificador estável da conta Google) e, na primeira entrada, o `email`.
 *
 * OBSERVAÇÃO SOBRE O DER: o diagrama traz apenas id, username, categoria,
 * status e pesquisador_id. Foram acrescentadas quatro colunas exigidas pelo
 * login com Google:
 *   - email       -> chave usada para liberar o acesso (pré-cadastro)
 *   - google_sub  -> "subject" do token do Google, preenchido no 1º login
 *   - nome        -> nome exibido, vindo do perfil Google
 *   - avatar_url  -> foto do perfil Google
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Categorias possíveis do usuário (coluna `categoria`).
 *
 *  1 ADMINISTRADOR — gerencia todos os dados do sistema
 *  2 PESQUISADOR   — gerencia apenas o que é dele (projetos, publicações,
 *                    cursos, titulações) e cadastra os próprios orientandos
 *  3 ORIENTANDO    — só visualiza os projetos em que está envolvido
 */
export const CATEGORIA_USUARIO = Object.freeze({
  ADMINISTRADOR: 1,
  PESQUISADOR: 2,
  ORIENTANDO: 3
});

/** Rótulos para mensagens de erro e telas. */
export const ROTULO_CATEGORIA = Object.freeze({
  [1]: 'Administrador',
  [2]: 'Pesquisador',
  [3]: 'Orientando'
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
      comment: 'identificador curto, usado na interface',
      validate: {
        notEmpty: { msg: 'O nome de usuário é obrigatório.' },
        len: { args: [3, 100], msg: 'O nome de usuário deve ter ao menos 3 caracteres.' }
      }
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: { msg: 'Já existe um usuário com esse e-mail.' },
      comment: 'e-mail da conta Google autorizada a entrar',
      validate: {
        notEmpty: { msg: 'O e-mail é obrigatório.' },
        isEmail: { msg: 'E-mail inválido.' }
      }
    },
    google_sub: {
      type: DataTypes.STRING(64),
      allowNull: true,
      unique: { msg: 'Esta conta Google já está vinculada a outro usuário.' },
      comment: 'subject do ID token do Google; preenchido no primeiro login'
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'nome vindo do perfil Google'
    },
    avatar_url: {
      type: DataTypes.STRING(400),
      allowNull: true,
      comment: 'foto do perfil Google'
    },
    ultimo_acesso: {
      type: DataTypes.DATE,
      allowNull: true
    },
    categoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: CATEGORIA_USUARIO.ORIENTANDO,
      validate: {
        isIn: { args: [Object.values(CATEGORIA_USUARIO)], msg: 'Categoria inválida.' }
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
      attributes: { exclude: ['google_sub'] }
    },
    scopes: {
      // usado apenas pelo fluxo de login
      completo: { attributes: { include: ['google_sub'] } }
    },
    hooks: {
      beforeValidate(usuario) {
        if (usuario.username) usuario.username = usuario.username.trim().toLowerCase();
        if (usuario.email) usuario.email = usuario.email.trim().toLowerCase();
      }
    }
  }
);

/** Nunca expõe o identificador da conta Google nas respostas da API. */
Usuario.prototype.toJSON = function toJSON() {
  const valores = { ...this.get() };
  delete valores.google_sub;
  return valores;
};

export default Usuario;
