import { Router } from 'express';

import * as controller from '../../controllers/titulacaoController.js';
import validate from '../../helpers/validate.js';
import { donoOuAdmin } from '../../helpers/auth.js';
import { titulacaoSchema, titulacaoUpdateSchema } from '../../helpers/entidadeSchemas.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.post('/', donoOuAdmin(), validate(titulacaoSchema), controller.criar);
router.put('/:id', donoOuAdmin(), validate(titulacaoUpdateSchema), controller.atualizar);
router.delete('/:id', donoOuAdmin(), controller.remover);

export default router;
