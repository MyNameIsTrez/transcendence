<template>
  <div class="collapse w-auto bg-base-200">
    <input type="checkbox" />
    <div class="collapse-title text-xl text-center font-bold px-0">Achievements</div>
    <div class="collapse-content">
      <div class="card w-[352px] bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="text-2xl font-bold">Unlocked</h2>
          <Achievement name="A good start" description="Win for the first time" />
          <Achievement name="Unstoppalbe!" description="Win 100 times in a row" />
        </div>
      </div>
      <br />
      <div class="card w-[352px] bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="text-2xl font-bold">Locked</h2>
          <Achievement name="Unfortunate" description="Lose for the first time" />
          <Achievement name="How?!" description="Lose 100 times in a row" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Achievement from './Achievement.vue'
</script>

<style lang="scss"></style>
