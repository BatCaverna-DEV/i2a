/**
 * Produção científica do grupo (tabela `producao` do DER).
 *
 * OBSERVAÇÕES SOBRE O DER:
 *  - o diagrama exibe apenas titulo, ano e veiculo, indicando "7 more..." de
 *    colunas ocultas; as colunas abaixo de `veiculo` são uma proposta para
 *    esses campos — ajuste conforme o diagrama completo;
 *  - `titulo` e `veiculo` eram VARCHAR(45). Título de artigo e nome de
 *    periódico passam disso com folga, então viraram VARCHAR(255).
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ANO_MAXIMO = new Date().getFullYear() + 1;

/** Natureza da produção (coluna `tipo`). */
export const TIPO_PRODUCAO = Object.freeze({
  ARTIGO_PERIODICO: 1,
  ARTIGO_EVENTO: 2,
  CAPITULO_LIVRO: 3,
  LIVRO: 4,
  DISSERTACAO: 5,
  TESE: 6,
  SOFTWARE: 7,
  PATENTE: 8,
  OUTRO: 99
});

const Producao = sequelize.define(
  'Producao',
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
        notEmpty: { msg: 'O título da produção é obrigatório.' },
        len: { args: [3, 255], msg: 'O título deve ter entre 3 e 255 caracteres.' }
      }
    },
    ano: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: { args: [1900], msg: 'Ano inválido.' },
        max: { args: [ANO_MAXIMO], msg: `O ano não pode ser posterior a ${ANO_MAXIMO}.` }
      }
    },
    veiculo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'periódico, evento ou editora'
    },

    // --- campos correspondentes ao "7 more..." do DER (proposta) ---
    tipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: TIPO_PRODUCAO.ARTIGO_PERIODICO,
      validate: {
        isIn: { args: [Object.values(TIPO_PRODUCAO)], msg: 'Tipo de produção inválido.' }
      }
    },
    doi: { type: DataTypes.STRING(100), allowNull: true },
    issn_isbn: { type: DataTypes.STRING(45), allowNull: true },
    volume: { type: DataTypes.STRING(20), allowNull: true },
    paginas: { type: DataTypes.STRING(20), allowNull: true },
    qualis: { type: DataTypes.STRING(10), allowNull: true },
    resumo: {
      // abstract da publicação; opcional, texto longo
      type: DataTypes.TEXT,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: { isUrl: { msg: 'URL inválida.' } }
    }
  },
  {
    tableName: 'producao',
    indexes: [{ fields: ['ano'] }, { fields: ['tipo'] }],
    hooks: {
      beforeValidate(producao) {
        // strings vazias viram null para não disparar validações como isUrl
        for (const campo of ['doi', 'issn_isbn', 'volume', 'paginas', 'qualis', 'url', 'veiculo']) {
          if (producao[campo] === '') producao[campo] = null;
        }
      }
    }
  }
);

export default Producao;
