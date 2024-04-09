import { createRouter, createWebHistory } from 'vue-router'
import Profile from '../components/sidebar/Profile.vue'
import LoginPage from '../components/LoginPage.vue'
import HomePage from '../components/HomePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomePage
    },
    {
      path: '/profile',
      component: Profile
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
