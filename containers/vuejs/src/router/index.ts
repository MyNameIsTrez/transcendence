import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import LoginPage from '../components/LoginPage.vue'
import Profile from '../components/sidebar/Profile.vue'
import Friends from '../components/sidebar/Friends.vue'
import Blocked from '../components/sidebar/Blocked.vue'
import UserProfile from '../components/sidebar/UserProfile.vue'
import Leaderboard from '../components/sidebar/Leaderboard.vue'
import TwoFactor from '../components/TwoFactor.vue'
import { get } from '@/httpRequests'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomePage,
      async beforeEnter(to) {
        const jwt = localStorage.getItem('jwt')
        if (!jwt) {
          return '/login'
        }
      },
      children: [
        {
          path: '/',
          component: Profile
        },
        {
          path: '/friends',
          component: Friends
        },
        {
          path: '/blocked',
          component: Blocked
        },
        {
          path: '/user/:intraId',
          component: UserProfile,
          props: true,
          async beforeEnter(to) {
            return await get(`api/user/me`)
              .then(async (me) => {
                if (to.params.intraId === me.intra_id.toString()) {
                  return '/'
                }
                return await get(`api/user/other/${to.params.intraId}`).catch((err) => {
                  return '/'
                })
              })
              .catch((err) => {
                return '/'
              })
          }
        },
        {
          path: '/leaderboard',
          component: Leaderboard
        }
      ]
    },
    {
      path: '/login',
      component: LoginPage
    },
    {
      path: '/twofactor',
      component: TwoFactor
    }
  ]
})

export default router
