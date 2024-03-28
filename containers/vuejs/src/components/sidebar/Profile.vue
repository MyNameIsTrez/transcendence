<template>
	<div class="p-6">
		<div class="grid justify-center">
			<span class="grid grid-cols-2">
				<div class="text-2xl justify-self-center text-yellow-200">mforstho</div>
				<!-- The button to open modal -->
				<label for="my_modal_7" class="btn w-24 justify-self-end">Edit</label>

				<!-- Put this part before </body> tag -->
				<input type="checkbox" id="my_modal_7" class="modal-toggle" />
				<div class="modal" role="dialog">
					<div class="modal-box">
						<p class="py-4">Edit your name</p>
						<span class="flex justify-center">
							<input type="text" placeholder="New name" class="input input-bordered w-full max-w-xs" />
							<button class="btn">Save</button>
						</span>
						<br>
						<p class="py-4">Upload new avatar</p>
						<input type="file" class="file-input file-input-bordered w-full max-w-md" />
					</div>
					<label class="modal-backdrop" for="my_modal_7">Close</label>
				</div>
			</span>
			<br>
			<div class="flex justify-between">
				<div class="avatar justify-start">
					<div class="w-24 rounded">
						<img src="/vuejs/code/src/assets/mforstho.png" />
					</div>
				</div>
				<div class="text">W/L ratio: <span class="text text-green-500">121</span>/<span
						class="text text-red-600">1</span></div>
			</div>

			<div style="clear: both; padding-top: 50px;">
				<!-- <div tabindex="0" class="collapse w-96 bg-base-200"> -->
				<div class="collapse w-96 bg-base-200">
					<input type="checkbox" />
					<div class="collapse-title text-xl font-medium">Match history</div>
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

			<!-- <div tabindex="0" class="collapse w-96 bg-base-200"> -->
			<!-- <div class="collapse w-96 bg-base-200">
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
					</div> -->

				<!-- </div>
			</div> -->
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
