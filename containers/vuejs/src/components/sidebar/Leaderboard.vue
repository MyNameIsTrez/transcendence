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
                <img src="/vuejs/code/src/assets/mforstho.png" alt="Avatar Tailwind CSS Component" />
              </div>
            </div>
            <div>
              <div class="font-bold">mforstho</div> <!-- naam clickable maken om profiel te bezoeken -->
            </div>
          </div>
        </td>
        <th>
		  <div>121/1</div>
        </th>
      </tr>
	  <RankComponent username="sbos" rank="2." :wins='56' :losses='23'/>
      <!-- row 2 -->
      <!-- <tr>
        <th>
          <label>
            <input type="checkbox" class="checkbox" />
          </label>
        </th>
        <td>
          <div class="flex items-center gap-3">
            <div class="avatar">
              <div class="mask mask-squircle w-12 h-12">
                <img src="/vuejs/code/src/assets/mforstho.png" alt="Avatar Tailwind CSS Component" />
              </div>
            </div>
            <div>
              <div class="font-bold">Brice Swyre</div>
              <div class="text-sm opacity-50">China</div>
            </div>
          </div>
        </td>
        <td>
          Carroll Group
          <br/>
          <span class="badge badge-ghost badge-sm">Tax Accountant</span>
        </td>
        <td>Red</td>
        <th>
          <button class="btn btn-ghost btn-xs">details</button>
        </th>
      </tr> -->
      <!-- row 3 -->
      <!-- <tr>
        <th>
          <label>
            <input type="checkbox" class="checkbox" />
          </label>
        </th>
        <td>
          <div class="flex items-center gap-3">
            <div class="avatar">
              <div class="mask mask-squircle w-12 h-12">
                <img src="/vuejs/code/src/assets/mforstho.png" alt="Avatar Tailwind CSS Component" />
              </div>
            </div>
            <div>
              <div class="font-bold">Marjy Ferencz</div>
              <div class="text-sm opacity-50">Russia</div>
            </div>
          </div>
        </td>
        <td>
          Rowe-Schoen
          <br/>
          <span class="badge badge-ghost badge-sm">Office Assistant I</span>
        </td>
        <td>Crimson</td>
        <th>
          <button class="btn btn-ghost btn-xs">details</button>
        </th>
      </tr> -->
      <!-- row 4 -->
      <!-- <tr>
        <th>
          <label>
            <input type="checkbox" class="checkbox" />
          </label>
        </th>
        <td>
          <div class="flex items-center gap-3">
            <div class="avatar">
              <div class="mask mask-squircle w-12 h-12">
                <img src="/vuejs/code/src/assets/mforstho.png" alt="Avatar Tailwind CSS Component" />
              </div>
            </div>
            <div>
              <div class="font-bold">Yancy Tear</div>
              <div class="text-sm opacity-50">Brazil</div>
            </div>
          </div>
        </td>
        <td>
          Wyman-Ledner
          <br/>
          <span class="badge badge-ghost badge-sm">Community Outreach Specialist</span>
        </td>
        <td>Indigo</td>
        <th>
          <button class="btn btn-ghost btn-xs">details</button>
        </th>
      </tr> -->
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

<style lang="scss" scoped>

</style>
