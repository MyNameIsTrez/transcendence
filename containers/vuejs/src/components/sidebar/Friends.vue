<template>
	<div class="p-6">
		<div class="flex justify-end">
			<div class="tooltip tooltip-left" data-tip="Add friend">
				<button class="btn btn-primary btn-square self-auto" onclick="my_modal_2.showModal()">
					<span class="material-symbols-outlined">person_add</span>
				</button>
				<dialog id="my_modal_2" class="modal">
					<div class="modal-box">
						<p class="py-4">Add a friend</p>
						<span class="flex justify-center">
							<input type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
							<button class="btn">Add</button>
						</span>
					</div>
					<form method="dialog" class="modal-backdrop">
						<button>close</button>
					</form>
				</dialog>
			</div>
		</div>
		<h1>---- Online ----</h1>
		<Friend name="sbos" status="online"
			image="https://cdn.intra.42.fr/users/9a7a6d2e4ef5139c2bc8bb5271f7e3cc/sbos.jpg" />
		<br>
		<Friend name="safoh" status="online"
			image="https://cdn.intra.42.fr/users/300b8f9ea2e55b6f9e7cf25723d86958/safoh.jpg" />
		<br>
		<h1>---- Offline ----</h1>
		<Friend name="vebnn" status="offline"
			image="https://cdn.intra.42.fr/users/0519bc4a463d666788591a6fcb3dc296/vbenneko.jpg" />
		<br>
		<Friend name="lvan" status="offline"
			image="https://cdn.intra.42.fr/users/fd9763e1d199fc213b51af711e0ecb83/lvan-bus.jpg" />
	</div>
</template>

<script setup lang="ts">
import Friend from './friends/Friend.vue'
</script>
