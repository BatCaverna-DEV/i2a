/**
 * Agrupa as rotas da área administrativa. Todas exigem access token JWT
 * válido — a verificação acontece uma única vez aqui.
 */
import { Router } from 'express';

import { autenticar } from '../helpers/auth.js';

import pesquisadorRoutes from './admin/pesquisadorRoutes.js';
import linhaRoutes from './admin/linhaRoutes.js';
import titulacaoRoutes from './admin/titulacaoRoutes.js';
import cursoRoutes from './admin/cursoRoutes.js';
import projetoRoutes from './admin/projetoRoutes.js';
import producaoRoutes from './admin/producaoRoutes.js';
import usuarioRoutes from './admin/usuarioRoutes.js';
import vagaRoutes from './admin/vagaRoutes.js';

const router = Router();

router.use(autenticar);

router.use('/pesquisadores', pesquisadorRoutes);
router.use('/linhas', linhaRoutes);
router.use('/titulacoes', titulacaoRoutes);
router.use('/cursos', cursoRoutes);
router.use('/projetos', projetoRoutes);
router.use('/producoes', producaoRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/vagas', vagaRoutes);

export default router;
