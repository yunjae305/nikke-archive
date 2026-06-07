import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/components/views/Index.vue'
import L2D from '@/components/views/L2D.vue'
import Tools from '@/components/views/Tools.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Index
    },
    {
      path: '/v',
      redirect: { path: '/visualiser' }
    },
    {
      path: '/v_m',
      redirect: { path: '/visualiser' }
    },
    {
      path: '/visualiser',
      name: 'visualiser',
      component: L2D
    },
    {
      path: '/t',
      redirect: { path: '/tools' }
    },
    {
      path: '/tools',
      name: 'tools',
      component: Tools
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'any',
      component: Index
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
