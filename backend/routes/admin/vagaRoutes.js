import { Router } from 'express';

import * as controller from '../../controllers/vagaController.js';
import validate from '../../helpers/validate.js';
import { autorizar } from '../../helpers/auth.js';
import { vagaSchema, vagaUpdateSchema } from '../../helpers/entidadeSchemas.js';
import { CATEGORIA_USUARIO } from '../../models/index.js';

const router = Router();

// orientando não abre vagas nem vê candidaturas; a posse (coordenador do
// projeto) é conferida no controller
router.use(autorizar(CATEGORIA_USUARIO.ADMINISTRADOR, CATEGORIA_USUARIO.PESQUISADOR));

router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.post('/', validate(vagaSchema), controller.criar);
router.put('/:id', validate(vagaUpdateSchema), controller.atualizar);
router.delete('/:id', controller.remover);

router.get('/:id/candidaturas', controller.candidaturas);
router.delete('/:id/candidaturas/:candidaturaId', controller.removerCandidatura);

export default router;
