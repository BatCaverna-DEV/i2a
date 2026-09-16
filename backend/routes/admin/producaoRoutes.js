import { Router } from 'express';

import * as controller from '../../controllers/producaoController.js';
import validate from '../../helpers/validate.js';
import {
  producaoSchema,
  producaoUpdateSchema,
  vinculoPesquisadorSchema
} from '../../helpers/entidadeSchemas.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.post('/', validate(producaoSchema), controller.criar);
router.put('/:id', validate(producaoUpdateSchema), controller.atualizar);
router.delete('/:id', controller.remover);

// autoria (tabela autores)
router.post('/:id/autores', validate(vinculoPesquisadorSchema), controller.adicionarAutor);
router.delete('/:id/autores/:pesquisadorId', controller.removerAutor);

export default router;
