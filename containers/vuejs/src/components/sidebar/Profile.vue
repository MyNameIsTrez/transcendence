<template>
	<div class="p-6">
		<div class="grid justify-center">
			<span class="grid grid-cols-2">
				<div class="text-2xl justify-self-start text-yellow-200">{{ username }}</div>
				<!-- The button to open modal -->
				<label for="my_modal_7" class="btn w-24 justify-self-end">Edit</label>

				<!-- Put this part before </body> tag -->
				<input type="checkbox" id="my_modal_7" class="modal-toggle" />
				<div class="modal" role="dialog">
					<div class="modal-box">
						<p class="py-4">Edit your name</p>
						<span class="flex justify-center">
							<input type="text" placeholder="New name" class="input input-bordered w-full max-w-xs"
								id="NewUsername" />
							<button class="btn">Save</button>
						</span>
						<br />
						<p class="py-4">Upload new avatar</p>
						<input name="file" type="file" class="file-input file-input-bordered w-full max-w-md"
							accept="image/*" @change="uploadProfilePicture" />
						<!-- <input type="file" class="file-input file-input-bordered w-full max-w-md" /> -->
					</div>
					<label class="modal-backdrop" for="my_modal_7">Close</label>
				</div>
			</span>
			<br />
			<div class="flex justify-between">
				<div class="avatar justify-start">
					<div class="w-24 rounded">
						<img :src="profilePicture" />
					</div>
				</div>
				<div class="text">
					W/L ratio: <span class="text text-green-500">121</span>/<span class="text text-red-600">1</span>
				</div>
			</div>

			<div style="clear: both; padding-top: 50px">
				<!-- <div tabindex="0" class="collapse w-96 bg-base-200"> -->
				<div class="collapse w-96 bg-base-200">
					<input type="checkbox" />
					<div class="collapse-title text-xl text-left">Match history</div>
					<div class="collapse-content">
						<MatchReport player="mforstho" opponent="safoh" :p1Score="10" :p2Score="7"
							v-bind:playerWon="true" />
						<br />
						<MatchReport player="mforstho" opponent="safoh" :p1Score="5" :p2Score="10"
							v-bind:playerWon="false" />
						<br />
						<MatchReport player="mforstho" opponent="safoh" :p1Score="10" :p2Score="3"
							v-bind:playerWon="true" />
					</div>
				</div>
			</div>
			<br />
			<Achievements />
		</div>
	</div>
</template>

<script setup lang="ts">
import MatchReport from './profile/MatchReport.vue'
// import Achievements from './profile/Achievements.vue'
import Achievements from './achievements/Achievements.vue'
import { get, getImage, post } from '../../httpRequests'

const username = await get('user/username')
const intraId = await get('user/intraId')
const profilePicture = await getImage(`user/profilePicture/${intraId}.png`)

function uploadProfilePicture(event: any) {
	let data = new FormData()
	data.append('name', 'profilePicture')
	data.append('file', event.target.files[0])
	post('user/profilePicture', data).then(() => location.reload())
}

</script>

<style lang="scss" scoped></style>
