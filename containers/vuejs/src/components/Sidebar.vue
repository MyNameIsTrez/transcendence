<template>
	<!-- <router-link to="Profile" tag="btn">foo</router-link> -->
	<aside>
		<router-link to="Profile" tag="button" class="btn w-3/12">Profile</router-link>
		<router-link to="Friends" class="btn w-4/12">Friends</router-link>
		<router-link to="Leaderboard" class="btn w-5/12">Leaderboard</router-link>
		<!-- <button class="btn text-white bg-blue-300">test</button> -->
		<div class="bg-base-100 border-base-300 rounded-box">
			<RouterView></RouterView>
		</div>

		<!-- TODO: een manier zoeken om het oude beneden te combineren met het nieuwe boven -->
		<!-- <div role="tablist" class="tabs tabs-lifted">
			<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Profile" checked />
			<div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
				<Profile />
			</div>
			<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Friends" />
			<div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
				<Friends />
			</div>
			<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Leaderboard" />
			<div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
				<Leaderboard />
			</div>
		</div> -->
		<!--
			<div role="tablist" class="tabs tabs-lifted">
			<router-link to="Profile" tag="input" type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Profile" checked>Profile</router-link>
			<div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
				<router-view></router-view>
			</div>
			<router-link to="Friends" tag="input" type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Friends">Friends</router-link>
			<div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
				<Friends />
			</div>
			<router-link to="Leaderboard" tag="input" type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Leaderboard">Leaderboard</router-link>
			<div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
				<Leaderboard />
			</div>
		</div>
		<router-view></router-view>
		 -->
	</aside>
</template>

<script lang="ts" setup>
import Profile from './sidebar/Profile.vue'
import Friends from './sidebar/Friends.vue'
import Leaderboard from './sidebar/Leaderboard.vue'

const defaultColor = 'bg-blue-300' // Default color
const activeColor = 'bg-blue-500' // Active color
const buttons = document.querySelectorAll('.btn') // Select all buttons

// console.log("lol");

buttons.forEach((btn) => {
	btn.addEventListener('click', () => {
		// Rest all button colors
		buttons.forEach((b) => {
			b.classList.add(defaultColor)
			b.classList.remove(activeColor)
		})
		console.log('test')
		// Add active color on the clicked button, remove default color
		btn.classList.remove(defaultColor)
		btn.classList.add(activeColor)
	})
})
</script>

<style lang="scss" scoped></style>
