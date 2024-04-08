<template>
	<div class="p-6">
		<div class="grid justify-center">
			<span class="grid grid-cols-2">
				<div class="text-2xl justify-self-start text-yellow-200">sbos</div>

			</span>
			<br>
			<div class="flex justify-between">
				<div class="avatar justify-start">
					<div class="w-24 rounded">
						<img src="https://cdn.intra.42.fr/users/9a7a6d2e4ef5139c2bc8bb5271f7e3cc/sbos.jpg" />
					</div>
				</div>
				<div class="text">W/L ratio: <span class="text text-green-500">121</span>/<span
						class="text text-red-600">1</span></div>
			</div>

			<div style="clear: both; padding-top: 50px;">
				<!-- <div tabindex="0" class="collapse w-96 bg-base-200"> -->
				<div class="collapse w-96 bg-base-200">
					<input type="checkbox" />
					<div class="collapse-title text-xl text-left">Match history</div>
					<div class="collapse-content">
						<MatchReport player="mforstho" opponent="safoh" :p1Score='10' :p2Score='7'
							v-bind:playerWon="true" />
						<br>
						<MatchReport player="mforstho" opponent="safoh" :p1Score='5' :p2Score='10'
							v-bind:playerWon="false" />
						<br>
						<MatchReport player="mforstho" opponent="safoh" :p1Score='10' :p2Score='3'
							v-bind:playerWon="true" />
					</div>
				</div>
			</div>
			<br>
			<Achievements />
		</div>
	</div>
</template>

<script setup lang="ts">
import MatchReport from './profile/MatchReport.vue'
// import Achievements from './profile/Achievements.vue'
import Achievements from './achievements/Achievements.vue';
</script>

<style lang="scss" scoped></style>
