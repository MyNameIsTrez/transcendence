<template>
  <div class="card w-auto bg-base-100 shadow-xl">
    <div class="card-body">
      <div v-if="playerWon">
        <div class="flex justify-between">
          <h2 class="card-title text-green-500">Win</h2>
          <h2 class="card-title">{{ p1Score }}</h2>
          <h2 class="card-title">/</h2>
          <h2 class="card-title">{{ p2Score }}</h2>
          <h2 class="card-title text-red-600">Loss</h2>
        </div>
      </div>
      <div v-else>
        <div class="flex justify-between">
          <h2 class="card-title text-red-600">Loss</h2>
          <h2 class="card-title">{{ p1Score }}</h2>
          <h2 class="card-title">/</h2>
          <h2 class="card-title">{{ p2Score }}</h2>
          <h2 class="card-title text-green-500">Win</h2>
        </div>
      </div>
      <br />
      <br />
      <div class="flex justify-between">
        <p class="text-justify text-blue-500">{{ player }}</p>
        <p class="text-justify">VS</p>
        <p class="text-justify">{{ opponent }}</p>
      </div>
    </div>
  </div>
</template>

<!-- Misschien nog datum/tijd van de match saven en displayen -->
<script>
export default {
  props: {
    player: String,
    opponent: String,
    p1Score: Number,
    p2Score: Number,
    playerWon: Boolean
  }
}
</script>
