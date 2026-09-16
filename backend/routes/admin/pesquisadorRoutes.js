import { Router } from 'express';

import * as controller from '../../controllers/pesquisadorController.js';
import validate from '../../helpers/validate.js';
import { autorizar } from '../../helpers/auth.js';
import { CATEGORIA_USUARIO } from '../../models/Usuario.js';
import { pesquisadorSchema, pesquisadorUpdateSchema } from '../../helpers/entidadeSchemas.js';

const router = Router();
const gestores = [CATEGORIA_USUARIO.ADMIN, CATEGORIA_USUARIO.COORDENADOR];

router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.get('/:id/completo', controller.completo);
router.post('/', autorizar(...gestores), validate(pesquisadorSchema), controller.criar);
router.put('/:id', autorizar(...gestores), validate(pesquisadorUpdateSchema), controller.atualizar);
router.delete('/:id', autorizar(CATEGORIA_USUARIO.ADMIN), controller.remover);

export default router;
