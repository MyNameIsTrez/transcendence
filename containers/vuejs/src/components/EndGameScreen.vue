<template>
  <div class="end-game-screen">
    <h1>Game Over</h1>
    <h2>You {{ props.won }}!</h2>
    <button @click="$emit('joinGame')">Play Again</button>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  won: Boolean
})
</script>
