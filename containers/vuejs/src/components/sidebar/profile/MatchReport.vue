<template>
  <div class="card w-auto bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between">
        <h2
          :class="`card-title ${props.p1Score > props.p2Score ? 'text-green-500' : 'text-red-600'}`"
        >
          {{ props.p1Score > props.p2Score ? 'Win' : 'Loss' }}
        </h2>
        <h2 class="card-title">{{ props.p1Score }}</h2>
        <h2 class="card-title">/</h2>
        <h2 class="card-title">{{ props.p2Score }}</h2>
        <h2
          :class="`card-title ${props.p1Score > props.p2Score ? 'text-red-600' : 'text-green-500'}`"
        >
          {{ props.p1Score > props.p2Score ? 'Loss' : 'Win' }}
        </h2>
      </div>
      <br />
      <br />
      <div class="flex justify-between">
        <p class="text-justify text-blue-500">{{ props.player }}</p>
        <p class="text-justify">VS</p>
        <p class="text-justify">{{ props.opponent }}</p>
      </div>
    </div>
  </div>
</template>

<!-- Misschien nog datum/tijd van de match saven en displayen -->
<script setup lang="ts">
const props = defineProps({
  player: String,
  opponent: String,
  p1Score: Number,
  p2Score: Number
})
</script>
