<template>
	<tr>
		<th>
			<div>{{ rank }}</div>
		</th>
		<td>
			<div class="flex items-center gap-3">
				<div class="avatar">
					<div class="mask mask-squircle w-12 h-12">
						<img src="/vuejs/code/src/assets/mforstho.png" alt="Avatar Tailwind CSS Component" />
					</div>
				</div>
				<div>
					<div class="font-bold">{{ username }}</div> <!-- naam clickable maken om profiel te bezoeken -->
				</div>
			</div>
		</td>
			<th class="grid grid-cols-3 place-items-center">
				<div>{{ wins }}</div>
				<div>/</div>
				<div>{{ losses }}</div>
			</th>
	</tr>
</template>

<script>
export default {
	props: {
		username: String,
		rank: String,
		wins: Number,
		losses: Number
	}
}
</script>

<style lang="scss" scoped></style>
