/**
 * Registra todos os models e declara as associações entre eles,
 * conforme o diagrama backend/DER.png.
 *
 * As chaves estrangeiras são criadas AQUI (e só aqui) — os models declaram
 * apenas o tipo da coluna. Isso evita constraints duplicadas no `sync`.
 *
 * Todas as chaves primárias e estrangeiras são UUID (DataTypes.UUID),
 * geradas pela aplicação com UUIDV4.
 */
import { sequelize } from '../config/database.js';

import Usuario from './Usuario.js';
import Pesquisador from './Pesquisador.js';
import Linha from './Linha.js';
import Titulacao from './Titulacao.js';
import Curso from './Curso.js';
import Projeto from './Projeto.js';
import Orientacao from './Orientacao.js';
import Producao from './Producao.js';
import Autor from './Autor.js';

/* ----------------------------------------------------------------
 * linhas 1 --- N pesquisador
 * Apagar uma linha não apaga os pesquisadores: eles ficam sem linha.
 * ---------------------------------------------------------------- */
Linha.hasMany(Pesquisador, {
  foreignKey: { name: 'linhas_id', allowNull: true },
  as: 'pesquisadores',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Pesquisador.belongsTo(Linha, { foreignKey: 'linhas_id', as: 'linha' });

/* ----------------------------------------------------------------
 * pesquisador 1 --- N usuarios
 * ---------------------------------------------------------------- */
Pesquisador.hasMany(Usuario, {
  foreignKey: { name: 'pesquisador_id', allowNull: true },
  as: 'usuarios',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Usuario.belongsTo(Pesquisador, { foreignKey: 'pesquisador_id', as: 'pesquisador' });

/* ----------------------------------------------------------------
 * pesquisador 1 --- N titulacao
 * A titulação não existe sem o pesquisador: cai junto.
 * ---------------------------------------------------------------- */
Pesquisador.hasMany(Titulacao, {
  foreignKey: { name: 'pesquisador_id', allowNull: false },
  as: 'titulacoes',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Titulacao.belongsTo(Pesquisador, { foreignKey: 'pesquisador_id', as: 'pesquisador' });

/* ----------------------------------------------------------------
 * pesquisador 1 --- N cursos
 * Bloqueia apagar um pesquisador que ainda responde por cursos.
 * ---------------------------------------------------------------- */
Pesquisador.hasMany(Curso, {
  foreignKey: { name: 'pesquisador_id', allowNull: false },
  as: 'cursos',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
Curso.belongsTo(Pesquisador, { foreignKey: 'pesquisador_id', as: 'responsavel' });

/* ----------------------------------------------------------------
 * pesquisador 1 --- N projetos (coordenação)
 * ---------------------------------------------------------------- */
Pesquisador.hasMany(Projeto, {
  foreignKey: { name: 'pesquisador_id', allowNull: false },
  as: 'projetosCoordenados',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
Projeto.belongsTo(Pesquisador, { foreignKey: 'pesquisador_id', as: 'coordenador' });

/* ----------------------------------------------------------------
 * pesquisador N --- N projetos (via orientacacoes)
 * ---------------------------------------------------------------- */
Pesquisador.belongsToMany(Projeto, {
  through: Orientacao,
  foreignKey: 'pesquisador_id',
  otherKey: 'projetos_id',
  as: 'projetos',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Projeto.belongsToMany(Pesquisador, {
  through: Orientacao,
  foreignKey: 'projetos_id',
  otherKey: 'pesquisador_id',
  as: 'equipe',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Orientacao.belongsTo(Pesquisador, { foreignKey: 'pesquisador_id', as: 'pesquisador' });
Orientacao.belongsTo(Projeto, { foreignKey: 'projetos_id', as: 'projeto' });

/* ----------------------------------------------------------------
 * pesquisador N --- N producao (via autores)
 * ---------------------------------------------------------------- */
Pesquisador.belongsToMany(Producao, {
  through: Autor,
  foreignKey: 'pesquisador_id',
  otherKey: 'producao_id',
  as: 'producoes',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Producao.belongsToMany(Pesquisador, {
  through: Autor,
  foreignKey: 'producao_id',
  otherKey: 'pesquisador_id',
  as: 'autores',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Autor.belongsTo(Pesquisador, { foreignKey: 'pesquisador_id', as: 'pesquisador' });
Autor.belongsTo(Producao, { foreignKey: 'producao_id', as: 'producao' });

export {
  sequelize,
  Usuario,
  Pesquisador,
  Linha,
  Titulacao,
  Curso,
  Projeto,
  Orientacao,
  Producao,
  Autor
};

export { CATEGORIA_USUARIO, ROTULO_CATEGORIA, STATUS_USUARIO } from './Usuario.js';
export { TIPO_PESQUISADOR, ROTULO_TIPO_PESQUISADOR } from './Pesquisador.js';
export { STATUS_PROJETO, TIPO_PROJETO } from './Projeto.js';
export { TIPO_PRODUCAO } from './Producao.js';

export default {
  sequelize,
  Usuario,
  Pesquisador,
  Linha,
  Titulacao,
  Curso,
  Projeto,
  Orientacao,
  Producao,
  Autor
};
