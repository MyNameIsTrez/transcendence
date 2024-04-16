import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import LoginPage from '../components/LoginPage.vue'
import Profile from '../components/sidebar/Profile.vue'
import Friends from '../components/sidebar/Friends.vue'
import FriendProfile from '../components/sidebar/FriendProfile.vue'
import Leaderboard from '../components/sidebar/Leaderboard.vue'

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			component: HomePage,
			children: [
				{
					path: '/profile',
					component: Profile
				},
				{
					path: '/friends',
					component: Friends
				},
				{
					path: '/friendprofile',
					component: FriendProfile
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
	]
})

export default router
