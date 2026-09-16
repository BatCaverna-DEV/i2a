/** Cursos e minicursos ofertados pelo grupo (tabela `cursos` do DER). */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Curso = sequelize.define(
  'Curso',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    titulo: {
      type: DataTypes.STRING(45),
      allowNull: false,
      validate: { notEmpty: { msg: 'O título do curso é obrigatório.' } }
    },
    resumo: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    inicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    inscricoes_inicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    inscricoes_fim: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pesquisador_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  },
  {
    tableName: 'cursos',
    indexes: [{ fields: ['pesquisador_id'] }],
    validate: {
      janelaDeInscricaoCoerente() {
        if (
          this.inscricoes_inicio &&
          this.inscricoes_fim &&
          new Date(this.inscricoes_inicio) > new Date(this.inscricoes_fim)
        ) {
          throw new Error('O início das inscrições deve ser anterior ao fim.');
        }
      }
    }
  }
);

export default Curso;
