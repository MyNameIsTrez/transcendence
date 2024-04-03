import { createRouter, createWebHistory } from 'vue-router'
import Profile from '../components/sidebar/Profile.vue'
import Friends from '../components/sidebar/Friends.vue'
import Leaderboard from '../components/sidebar/Leaderboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
    	path: '/profile',
    	component: Profile,
    },
	{
		path: '/friends',
		component: Friends,
	},
	{
		path: '/leaderboard',
		component: Leaderboard,
	}
    // {
    //   path: '/about',
    //   component: () => import('../views/About.vue')
    // }
  ]
})

export default router
