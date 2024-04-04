import { createRouter, createWebHistory } from 'vue-router'
import ProfilePage from './pages/ProfilePage.vue'
import LoginPage from './pages/LoginPage.vue'
import HomePage from './pages/HomePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomePage
    },
    {
      path: '/profile',
      component: ProfilePage
    },
    {
      path: '/login',
      component: LoginPage
    }

    // {
    //   path: '/about',
    //   component: () => import('../views/About.vue')
    // }
  ]
})

export default router
