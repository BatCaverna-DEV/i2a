import { Router } from 'express';

import * as controller from '../controllers/authController.js';
import validate from '../helpers/validate.js';
import { autenticar } from '../helpers/auth.js';
import { loginLimiter } from '../helpers/rateLimit.js';
import { googleSchema, refreshSchema } from '../helpers/authSchemas.js';

const router = Router();

// entrada: ID token do Google Identity Services
router.post('/google', loginLimiter, validate(googleSchema), controller.google);

// renovação do access token
router.post('/refresh', validate(refreshSchema), controller.refresh);

// rotas do usuário já autenticado
router.get('/eu', autenticar, controller.eu);
router.post('/desvincular', autenticar, controller.desvincular);

export default router;
