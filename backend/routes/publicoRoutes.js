/** Rotas somente leitura consumidas pelo site público (sem autenticação). */
import { Router } from 'express';

import * as controller from '../controllers/publicoController.js';

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

export default router;
