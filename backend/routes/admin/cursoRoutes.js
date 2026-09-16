import { Router } from 'express';

import * as controller from '../../controllers/cursoController.js';
import validate from '../../helpers/validate.js';
import { donoOuAdmin } from '../../helpers/auth.js';
import { cursoSchema, cursoUpdateSchema } from '../../helpers/entidadeSchemas.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.post('/', donoOuAdmin(), validate(cursoSchema), controller.criar);
router.put('/:id', donoOuAdmin(), validate(cursoUpdateSchema), controller.atualizar);
router.delete('/:id', donoOuAdmin(), controller.remover);

export default router;
