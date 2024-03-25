<template>
<div class="grid justify-center">
	<p class="text-2xl text-center text-yellow-200">mforstho</p>
	<br>
	<div class="flex justify-between">
		<div class="avatar justify-start">
			<div class="w-24 rounded">
				<img src="/vuejs/code/src/assets/mforstho.png" />
			</div>
		</div>
		<div class="text">W/L ratio: <span class="text text-green-500">121</span>/<span class="text text-red-600">1</span></div>
	</div>

	<div style="clear: both; padding-top: 50px;">
		<!-- <div tabindex="0" class="collapse w-96 bg-base-200"> -->
		<div class="collapse w-96 bg-base-200">
			<input type="checkbox" />
			<div class="collapse-title text-xl font-medium">Match history</div>
			<div class="collapse-content">
				<MatchReport player="mforstho" opponent="safoh" :p1Score='10' :p2Score='7' v-bind:playerWon="true" />
				<br>
				<MatchReport player="mforstho" opponent="safoh" :p1Score='5' :p2Score='10' v-bind:playerWon="false" />
				<br>
				<MatchReport player="mforstho" opponent="safoh" :p1Score='10' :p2Score='3' v-bind:playerWon="true" />
			</div>
		</div>
	</div>

	<br>

	<!-- <div tabindex="0" class="collapse w-96 bg-base-200"> -->
	<div class="collapse w-96 bg-base-200">
		<input type="checkbox" />
		<div class="collapse-title text-xl font-medium">Achievements</div>
			<div class="collapse-content">
				<div class="card w-[352px] bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="text-2xl font-bold">Unlocked</h2>
						<div class="tooltip tooltip-top" data-tip="Win for the first time">
							<p>A good start</p>
						</div>
						<div class="tooltip tooltip-top" data-tip="Win 100 times in a row">
							<p>Unstoppable!</p>
						</div>
					</div>
				</div>
				<br>
				<div class="card w-[352px] bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="text-2xl font-bold">Locked</h2>
						<div class="tooltip tooltip-top" data-tip="Lose for the first time">
							<p>Unfortunate</p>
						</div>
						<div class="tooltip tooltip-top" data-tip="Lose 100 times in a row">
							<p>How?!</p>
						</div>
					</div>
				</div>
			</div>
	</div>
</div>
</template>

<script setup lang="ts">
import MatchReport from './profile/MatchReport.vue'
// import Achievements from './profile/Achievements.vue'
</script>

<style lang="scss" scoped>

</style>
