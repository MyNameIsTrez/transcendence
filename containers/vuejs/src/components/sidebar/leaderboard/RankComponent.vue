<template>
	<tr>
		<th>
			<div>{{ rank }}</div>
		</th>
		<td>
			<div class="flex items-center gap-3">
				<div class="avatar">
					<div class="mask mask-squircle w-12 h-12">
						<img :src="`${this.image}`" alt="Avatar Tailwind CSS Component" />
					</div>
				</div>
				<div>
					<div class="font-bold">{{ username }}</div> <!-- naam clickable maken om profiel te bezoeken -->
				</div>
			</div>
		</td>
		<th class="align-middle">
			<!-- <div class="grid grid-cols-3 place-items-center"> -->
			<div>{{ wins }}/{{ losses }}</div>
			<!-- <div>/</div> -->
			<!-- <div>{{ losses }}</div> -->
			<!-- </div> -->
		</th>
	</tr>
</template>

<script>
export default {
	props: {
		username: String,
		rank: String,
		wins: Number,
		losses: Number,
		image: String
	}
}
</script>

<style lang="scss" scoped></style>
