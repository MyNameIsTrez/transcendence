<template>
  <div class="p-6">
    <div class="grid justify-center">
      <span class="grid grid-cols-2">
        <div class="text text-base justify-self-start self-center text-yellow-200 w-64">
          {{ username }}
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
          W/L ratio: <span class="text text-green-500">{{ wins }}</span
          >/<span class="text text-red-600">{{ losses }}</span>
        </div>
      </div>

      <div style="clear: both; padding-top: 50px">
        <!-- <div tabindex="0" class="collapse w-96 bg-base-200"> -->
        <div class="collapse w-auto bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title text-xl text-center font-bold px-0">Match history</div>
          <div class="collapse-content">
            <MatchReport player="mforstho" opponent="safoh" :p1Score="10" :p2Score="7" />
            <br />
            <MatchReport player="mforstho" opponent="safoh" :p1Score="5" :p2Score="10" />
            <br />
            <MatchReport player="mforstho" opponent="safoh" :p1Score="10" :p2Score="3" />
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
import Achievements from './achievements/Achievements.vue'

import { get, getImage } from '../../httpRequests'
import { ref } from 'vue'

const props = defineProps({
  intraId: Number
})

const user = await get(`api/user/other/${props.intraId}`)
// console.log('user', user)
const username = user.username
const wins = user.wins
const losses = user.losses
const profilePicture = await getImage(`api/user/profilePicture/${user.intra_id}.png`)
</script>

<!--
91418
76657
 -->
