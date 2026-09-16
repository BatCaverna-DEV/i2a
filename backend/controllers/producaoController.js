import crudFactory from './crudFactory.js';
import asyncHandler from '../helpers/asyncHandler.js';
import ApiError from '../helpers/ApiError.js';
import { Producao, Pesquisador, Autor } from '../models/index.js';

const includes = [
  { model: Pesquisador, as: 'autores', attributes: ['id', 'nome'], through: { attributes: [] } }
];

const base = crudFactory({
  model: Producao,
  nome: 'Produção',
  includes,
  camposBusca: ['titulo', 'veiculo', 'doi'],
  filtrosPermitidos: ['ano', 'tipo', 'qualis'],
  ordenacaoPadrao: [['ano', 'DESC']]
});

/** POST /admin/producoes/:id/autores — vincula um pesquisador à produção. */
export const adicionarAutor = asyncHandler(async (req, res) => {
  const { pesquisador_id } = req.body;
  const producao = await Producao.findByPk(req.params.id);
  if (!producao) throw ApiError.notFound('Produção não encontrada.');

  const pesquisador = await Pesquisador.findByPk(pesquisador_id);
  if (!pesquisador) throw ApiError.notFound('Pesquisador não encontrado.');

  const [vinculo, criado] = await Autor.findOrCreate({
    where: { producao_id: producao.id, pesquisador_id }
  });
  res.status(criado ? 201 : 200).json(vinculo);
});

/** DELETE /admin/producoes/:id/autores/:pesquisadorId — remove a autoria. */
export const removerAutor = asyncHandler(async (req, res) => {
  const removidos = await Autor.destroy({
    where: { producao_id: req.params.id, pesquisador_id: req.params.pesquisadorId }
  });
  if (!removidos) throw ApiError.notFound('Autoria não encontrada.');
  res.status(204).send();
});

export const { listar, buscar, criar, atualizar, remover } = base;
