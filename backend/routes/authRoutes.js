import { Router } from 'express';

import * as controller from '../controllers/authController.js';
import validate from '../helpers/validate.js';
import { autenticar } from '../helpers/auth.js';
import { loginLimiter, totpLimiter } from '../helpers/rateLimit.js';
import {
  loginSchema,
  verificarSchema,
  refreshSchema,
  trocarSenhaSchema
} from '../helpers/authSchemas.js';

const router = Router();

// etapa 1 — usuário e senha
router.post('/login', loginLimiter, validate(loginSchema), controller.login);

// etapa 2 — código de 6 dígitos do Google Authenticator
router.post('/verificar', totpLimiter, validate(verificarSchema), controller.verificar);

// renovação do access token
router.post('/refresh', validate(refreshSchema), controller.refresh);

// rotas do usuário já autenticado
router.get('/eu', autenticar, controller.eu);
router.post('/trocar-senha', autenticar, validate(trocarSenhaSchema), controller.trocarSenha);
router.get('/2fa/qrcode', autenticar, controller.qrcode2fa);
router.post('/2fa/reiniciar', autenticar, controller.reiniciar2fa);

export default router;
