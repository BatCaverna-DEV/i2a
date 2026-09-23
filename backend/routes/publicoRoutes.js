/**
 * Rotas consumidas pelo site público (sem autenticação). São somente leitura,
 * com uma exceção: o envio de candidatura a uma vaga.
 */
import { Router } from 'express';

import * as controller from '../controllers/publicoController.js';
import validate from '../helpers/validate.js';
import { candidaturaLimiter } from '../helpers/rateLimit.js';
import { candidaturaSchema } from '../helpers/entidadeSchemas.js';

const router = Router();

router.get('/estatisticas', controller.estatisticas);
router.get('/linhas', controller.linhas);

router.get('/pesquisadores', controller.pesquisadores);
router.get('/pesquisadores/:id', controller.pesquisador);

router.get('/projetos', controller.projetos);
router.get('/projetos/:id', controller.projeto);

router.get('/cursos', controller.cursos);
router.get('/cursos/:id', controller.curso);

router.get('/producoes', controller.producoes);

router.get('/vagas', controller.vagas);
router.get('/vagas/:id', controller.vaga);
router.post(
  '/vagas/:id/candidaturas',
  candidaturaLimiter,
  validate(candidaturaSchema),
  controller.candidatar
);

export default router;
