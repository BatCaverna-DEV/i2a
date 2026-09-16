/** Raiz do roteamento da API: /api/auth, /api/publico e /api/admin. */
import { Router } from 'express';

import authRoutes from './authRoutes.js';
import publicoRoutes from './publicoRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.get('/', (req, res) =>
  res.json({
    nome: 'API do Grupo de Pesquisa I2A',
    versao: '1.0.0',
    recursos: ['/auth', '/publico', '/admin']
  })
);

router.use('/auth', authRoutes);
router.use('/publico', publicoRoutes);
router.use('/admin', adminRoutes);

export default router;
