<template>
  <div class="card w-auto bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between">
        <h2
          :class="`card-title ${props.leftPlayerScore > props.rightPlayerScore ? 'text-green-500' : 'text-red-600'}`"
        >
          {{ props.leftPlayerScore > props.rightPlayerScore ? 'Win' : 'Loss' }}
        </h2>
        <h2 class="card-title">{{ props.leftPlayerScore }}</h2>
        <h2 class="card-title">/</h2>
        <h2 class="card-title">{{ props.rightPlayerScore }}</h2>
        <h2
          :class="`card-title ${props.leftPlayerScore > props.rightPlayerScore ? 'text-red-600' : 'text-green-500'}`"
        >
          {{ props.leftPlayerScore > props.rightPlayerScore ? 'Loss' : 'Win' }}
        </h2>
      </div>
      <br />
      <br />
      <div class="flex justify-between">
        <p class="text-justify text-blue-500">{{ props.leftPlayer }}</p>
        <p class="text-justify">VS</p>
        <p class="text-justify">{{ props.rightPlayer }}</p>
      </div>
    </div>
  </div>
</template>

<!-- Misschien nog datum/tijd van de match saven en displayen -->
<script setup lang="ts">
const props = defineProps({
  leftPlayer: String,
  rightPlayer: String,
  leftPlayerScore: Number,
  rightPlayerScore: Number
})
</script>
