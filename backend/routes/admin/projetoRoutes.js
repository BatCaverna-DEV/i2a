import { Router } from 'express';

import * as controller from '../../controllers/projetoController.js';
import validate from '../../helpers/validate.js';
import { donoOuAdmin } from '../../helpers/auth.js';
import {
  projetoSchema,
  projetoUpdateSchema,
  vinculoPesquisadorSchema
} from '../../helpers/entidadeSchemas.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.post('/', donoOuAdmin(), validate(projetoSchema), controller.criar);
router.put('/:id', donoOuAdmin(), validate(projetoUpdateSchema), controller.atualizar);
router.delete('/:id', donoOuAdmin(), controller.remover);

// equipe do projeto (tabela orientacacoes)
router.post('/:id/equipe', validate(vinculoPesquisadorSchema), controller.adicionarMembro);
router.delete('/:id/equipe/:pesquisadorId', controller.removerMembro);

export default router;
