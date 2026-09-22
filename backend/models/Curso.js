/**
 * Cursos e minicursos ofertados pelo grupo (tabela `cursos` do DER).
 *
 * OBSERVAÇÃO SOBRE O DER: `titulo` e `resumo` eram VARCHAR(45) — curto demais
 * para os dois. Viraram VARCHAR(255) e TEXT.
 */
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
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O título do curso é obrigatório.' },
        len: { args: [3, 255], msg: 'O título deve ter entre 3 e 255 caracteres.' }
      }
    },
    resumo: {
      // TEXT: a ementa do curso cabe inteira
      type: DataTypes.TEXT,
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
