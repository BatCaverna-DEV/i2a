/**
 * Rotas do sistema, divididas em dois ramos:
 *   /        -> site público, com PublicLayout
 *   /admin   -> painel administrativo, com AdminLayout e guarda de JWT
 */
import { createRouter, createWebHistory } from 'vue-router';

import PublicLayout from '@/layouts/PublicLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useAuthStore, CATEGORIA } from '@/stores/auth';

const routes = [
  // --------------------------- público ---------------------------
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'home', component: () => import('@/views/publico/HomeView.vue') },
      { path: 'sobre', name: 'sobre', component: () => import('@/views/publico/SobreView.vue') },
      {
        path: 'pesquisadores',
        name: 'pesquisadores',
        component: () => import('@/views/publico/PesquisadoresView.vue')
      },
      {
        path: 'pesquisadores/:id',
        name: 'pesquisador',
        component: () => import('@/views/publico/PesquisadorView.vue'),
        props: true
      },
      {
        path: 'projetos',
        name: 'projetos',
        component: () => import('@/views/publico/ProjetosView.vue')
      },
      {
        path: 'projetos/:id',
        name: 'projeto',
        component: () => import('@/views/publico/ProjetoView.vue'),
        props: true
      },
      { path: 'cursos', name: 'cursos', component: () => import('@/views/publico/CursosView.vue') },
      {
        path: 'cursos/:id',
        name: 'curso',
        component: () => import('@/views/publico/CursoView.vue'),
        props: true
      },
      {
        path: 'producoes',
        name: 'producoes',
        component: () => import('@/views/publico/ProducoesView.vue')
      }
    ]
  },

  // ------------------------ login do admin ------------------------
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/admin/LoginView.vue'),
    meta: { somenteVisitante: true }
  },

  // ------------------------ área restrita -------------------------
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requerAuth: true },
    children: [
      { path: '', redirect: { name: 'admin-dashboard' } },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/DashboardView.vue')
      },
      {
        path: 'pesquisadores',
        name: 'admin-pesquisadores',
        component: () => import('@/views/admin/PesquisadoresAdmin.vue')
      },
      {
        path: 'linhas',
        name: 'admin-linhas',
        component: () => import('@/views/admin/LinhasAdmin.vue')
      },
      {
        path: 'projetos',
        name: 'admin-projetos',
        component: () => import('@/views/admin/ProjetosAdmin.vue')
      },
      {
        path: 'cursos',
        name: 'admin-cursos',
        component: () => import('@/views/admin/CursosAdmin.vue')
      },
      {
        path: 'producoes',
        name: 'admin-producoes',
        component: () => import('@/views/admin/ProducoesAdmin.vue')
      },
      {
        path: 'usuarios',
        name: 'admin-usuarios',
        component: () => import('@/views/admin/UsuariosAdmin.vue'),
        meta: { categorias: [CATEGORIA.ADMIN] }
      },
      {
        path: 'perfil',
        name: 'admin-perfil',
        component: () => import('@/views/admin/PerfilView.vue')
      }
    ]
  },

  { path: '/:pathMatch(.*)*', name: 'nao-encontrado', component: () => import('@/views/NotFound.vue') }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, saved) => saved ?? { top: 0 }
});

/** Guarda global: protege /admin e respeita as categorias exigidas pela rota. */
router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // garante que o usuário foi carregado antes de decidir
  if (auth.accessToken && !auth.usuario) {
    await auth.restaurarSessao();
  }

  if (to.meta.requerAuth && !auth.autenticado) {
    return { name: 'admin-login', query: { redirect: to.fullPath } };
  }

  if (to.meta.somenteVisitante && auth.autenticado) {
    return { name: 'admin-dashboard' };
  }

  const categorias = to.meta.categorias;
  if (categorias && !categorias.includes(auth.usuario?.categoria)) {
    return { name: 'admin-dashboard' };
  }

  return true;
});

export default router;
