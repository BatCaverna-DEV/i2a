import { Router } from 'express';

import * as controller from '../../controllers/pesquisadorController.js';
import validate from '../../helpers/validate.js';
import { autorizar, bloquearOrientando } from '../../helpers/auth.js';
import { CATEGORIA_USUARIO } from '../../models/Usuario.js';
import { pesquisadorSchema, pesquisadorUpdateSchema } from '../../helpers/entidadeSchemas.js';

const router = Router();

// leitura liberada para os três perfis
router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.get('/:id/completo', controller.completo);

// escrita: orientando nunca; pesquisador só cadastra orientandos
// (a regra por categoria fica no controller, que conhece o corpo da requisição)
router.use(bloquearOrientando);

router.post('/', validate(pesquisadorSchema), controller.criar);
router.put('/:id', validate(pesquisadorUpdateSchema), controller.atualizar);
router.delete('/:id', autorizar(CATEGORIA_USUARIO.ADMINISTRADOR), controller.remover);

export default router;
