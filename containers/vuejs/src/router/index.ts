import { createRouter, createWebHistory } from 'vue-router'
import Profile from './pages/Profile.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // {
    //   path: '/profile',
    //   component: Profile
    // }
    // {
    //   path: '/about',
    //   component: () => import('../views/About.vue')
    // }
  ]
})

export default router
