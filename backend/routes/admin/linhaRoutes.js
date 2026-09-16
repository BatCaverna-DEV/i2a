import { Router } from 'express';

import * as controller from '../../controllers/linhaController.js';
import validate from '../../helpers/validate.js';
import { somenteAdmin } from '../../helpers/auth.js';
import { linhaSchema } from '../../helpers/entidadeSchemas.js';

const router = Router();

// todo mundo lê as linhas (são usadas nos formulários), só o admin escreve
router.get('/', controller.listar);
router.get('/:id', controller.buscar);

router.post('/', somenteAdmin, validate(linhaSchema), controller.criar);
router.put('/:id', somenteAdmin, validate(linhaSchema.partial()), controller.atualizar);
router.delete('/:id', somenteAdmin, controller.remover);

export default router;
