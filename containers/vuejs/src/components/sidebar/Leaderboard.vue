<template>
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>Win/Loss</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(user, index) in users" :key="user.intraId">
          <RankComponent
            :username="user.name"
            :intraId="user.intraId"
            :wins="user.wins"
            :losses="user.losses"
            :rank="index + 1"
          />
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import RankComponent from './leaderboard/RankComponent.vue'
import { get } from '../../httpRequests'

const users = await get('api/user/allUsers')
</script>
