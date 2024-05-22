<template>
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
        <template v-for="user in users">
          <RankComponent
            :username="user.name"
            :intraId="user.intraId"
            :wins="user.wins"
            :losses="user.losses"
			:rank="nbr++"
          />
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import RankComponent from './leaderboard/RankComponent.vue'
import { get, post } from '../../httpRequests'

const nbr = 1;

const users = await get('api/user/allUsers')
</script>

<style lang="scss" scoped></style>
