import { Router } from 'express';

import * as controller from '../../controllers/usuarioController.js';
import validate from '../../helpers/validate.js';
import { somenteAdmin } from '../../helpers/auth.js';
import { usuarioSchema, usuarioUpdateSchema } from '../../helpers/entidadeSchemas.js';

const router = Router();

// toda a gestão de usuários é exclusiva de administradores
router.use(somenteAdmin);

router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.post('/', validate(usuarioSchema), controller.criar);
router.put('/:id', validate(usuarioUpdateSchema), controller.atualizar);
router.delete('/:id', controller.remover);
router.post('/:id/desvincular', controller.desvincular);

export default router;
