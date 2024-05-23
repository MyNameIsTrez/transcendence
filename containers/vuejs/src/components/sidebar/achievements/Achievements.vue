<template>
  <div class="collapse w-auto bg-base-200">
    <input type="checkbox" />
    <div class="collapse-title text-xl text-center font-bold px-0">Achievements</div>
    <div class="collapse-content">
      <div class="card w-auto bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="text-2xl font-bold text-center">Unlocked</h2>
          <Achievement v-if="wonOnce" name="A good start" description="Win for the first time" />
          <Achievement v-if="wonHundred" name="Unstoppable!" description="Win 100 times" />
          <Achievement v-if="lostOnce" name="Unfortunate" description="Lose for the first time" />
          <Achievement v-if="lostHundred" name="How?!" description="Lose 100 times" />
        </div>
      </div>
      <br />
      <div class="card w-auto bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="text-2xl font-bold text-center">Locked</h2>
          <Achievement v-if="!wonOnce" name="A good start" description="Win for the first time" />
          <Achievement v-if="!wonHundred" name="Unstoppable!" description="Win 100 times" />
          <Achievement v-if="!lostOnce" name="Unfortunate" description="Lose for the first time" />
          <Achievement v-if="!lostHundred" name="How?!" description="Lose 100 times" />
        </div>
      </div>
    </div>
  </div>
</template>

<script async setup lang="ts">
import Achievement from './Achievement.vue'
import { get } from '../../../httpRequests'

const user = await get('api/user/me')

const { wonOnce, wonHundred, lostOnce, lostHundred } = user.achievements
</script>

<style lang="scss"></style>
