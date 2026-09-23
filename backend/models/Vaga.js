/**
 * Vagas abertas pelos pesquisadores para os projetos (tabela `vagas`).
 *
 * Não existe no DER. Cada vaga pertence a um projeto, e quem responde por ela
 * é o coordenador do projeto — por isso a vaga não guarda pesquisador_id: a
 * posse é conferida pelo `projetos.pesquisador_id`.
 *
 * A vaga aparece no site enquanto `prazo` não tiver passado; depois disso
 * continua no painel, com as candidaturas recebidas, mas some da lista pública
 * e deixa de aceitar inscrições.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Vaga = sequelize.define(
  'Vaga',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O título da vaga é obrigatório.' },
        len: { args: [3, 255], msg: 'O título deve ter entre 3 e 255 caracteres.' }
      }
    },
    descricao: {
      // atividades, requisitos, carga horária, bolsa... texto livre
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantidade: {
      // número de vagas ofertadas
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: { args: [1], msg: 'A quantidade de vagas deve ser ao menos 1.' }
      }
    },
    prazo: {
      // último instante em que a vaga aceita candidaturas
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Prazo inválido.' }
      }
    },
    projetos_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  },
  {
    tableName: 'vagas',
    indexes: [{ fields: ['projetos_id'] }, { fields: ['prazo'] }]
  }
);

/** A vaga ainda aceita candidaturas? */
Vaga.prototype.aberta = function aberta(agora = new Date()) {
  return new Date(this.prazo) >= agora;
};

export default Vaga;
