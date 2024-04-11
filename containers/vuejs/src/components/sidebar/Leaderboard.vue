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
        <RankComponent
          username="mforstho"
          rank="1."
          image="/src/assets/mforstho.png"
          :wins="121"
          :losses="1"
        />
        <RankComponent
          username="sbos"
          rank="2."
          image="https://cdn.intra.42.fr/users/9a7a6d2e4ef5139c2bc8bb5271f7e3cc/sbos.jpg"
          :wins="56"
          :losses="23"
        />
        <RankComponent
          username="safoh"
          rank="3."
          image="https://cdn.intra.42.fr/users/300b8f9ea2e55b6f9e7cf25723d86958/safoh.jpg"
          :wins="24"
          :losses="56"
        />
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
