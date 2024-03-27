<template>
	<!-- <div class="text text-center">-- Leaderboard --</div>
	<br>
	<div class="grid place-content-center">
		<div class="card w-80 h- bg-base-200 shadow-xl">
			<div class="card-body">
				<div class="text text-center">1. mforstho</div>
			</div>
		</div>
		<br>
		<div class="card w-80 h- bg-base-200 shadow-xl">
			<div class="card-body">
				<div class="text text-center">2. safoh</div>
			</div>
		</div>
		<br>
	</div> -->
	<div class="overflow-x-auto">
		<table class="table">
			<!-- head -->
			<thead>
				<tr>
					<th>Rank</th>
					<th>Name</th>
					<th>Win/Loss</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<th>
						<div>1.</div>
					</th>
					<td>
						<div class="flex items-center gap-3">
							<div class="avatar">
								<div class="mask mask-squircle w-12 h-12">
									<img src="/vuejs/code/src/assets/mforstho.png"
										alt="Avatar Tailwind CSS Component" />
								</div>
							</div>
							<div>
								<div class="font-bold">mforstho</div>
								<!-- naam clickable maken om profiel te bezoeken -->
							</div>
						</div>
					</td>
					<th class="align-middle">
						<div class="grid grid-cols-3 place-items-center">
							<div>121</div>
							<div>/</div>
							<div>1</div>
						</div>
					</th>
				</tr>
				<RankComponent username="sbos" rank="2." :wins='56' :losses='23' />
				<RankComponent username="safoh" rank="3." :wins='24' :losses='56' />
			</tbody>
			<!-- foot -->
			<!-- <tfoot>
      <tr>
        <th></th>
        <th>Name</th>
        <th>Job</th>
        <th>Favorite Color</th>
        <th></th>
      </tr>
    </tfoot> -->

		</table>
	</div>
</template>

<script setup lang="ts">
import RankComponent from './leaderboard/RankComponent.vue'
</script>

<style lang="scss" scoped></style>
