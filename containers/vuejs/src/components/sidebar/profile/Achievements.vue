<template>
	<div class="card w-[352px] bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="text-2xl font-bold">Unlocked</h2>
			<div v-if="status">
				<div class="tooltip tooltip-top" data-tip="Win for the first time"><p>A good start</p></div>
			</div>
			<div v-if="status">
				<div class="tooltip tooltip-top" data-tip="Win 100 times in a row"><p>Unstoppable!</p></div>
			</div>
			<div v-if="status">
				<div class="tooltip tooltip-top" data-tip="Lose for the first time"><p>Unfortunate</p></div>
			</div>
			<div v-if="status">
				<div class="tooltip tooltip-top" data-tip="Lose 100 times in a row"><p>How?!</p></div>
			</div>
		</div>
	</div>
	<br>
	<div class="card w-[352px] bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="text-2xl font-bold">Locked</h2>
			<div class="tooltip tooltip-top" data-tip="Win for the first time"><p>A good start</p></div>
			<div class="tooltip tooltip-top" data-tip="Win 100 times in a row"><p>Unstoppable!</p></div>
			<div class="tooltip tooltip-top" data-tip="Lose for the first time"><p>Unfortunate</p></div>
			<div class="tooltip tooltip-top" data-tip="Lose 100 times in a row"><p>How?!</p></div>
		</div>
	</div>
</template>

<!--


-->
<script setup lang="ts">
// export default {
// 	props: {
// 		achievement1: boolean
// 	}
// }
// import { rootSocket } from '../../SocketManager'
// rootSocket.emit("getUsername")
// rootSocket.on("username", function (username: string) {console.log(username)})
</script>
