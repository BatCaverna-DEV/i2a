import { Router } from 'express';

import * as controller from '../../controllers/producaoController.js';
import validate from '../../helpers/validate.js';
import { bloquearOrientando } from '../../helpers/auth.js';
import {
  producaoSchema,
  producaoUpdateSchema,
  vinculoPesquisadorSchema
} from '../../helpers/entidadeSchemas.js';

const router = Router();

// a listagem já vem filtrada pelo papel (só as publicações de que é autor)
router.get('/', controller.listar);
router.get('/:id', controller.buscar);

// escrita bloqueada para orientando; a autoria é conferida no controller
router.use(bloquearOrientando);

router.post('/', validate(producaoSchema), controller.criar);
router.put('/:id', validate(producaoUpdateSchema), controller.atualizar);
router.delete('/:id', controller.remover);

router.post('/:id/autores', validate(vinculoPesquisadorSchema), controller.adicionarAutor);
router.delete('/:id/autores/:pesquisadorId', controller.removerAutor);

export default router;
