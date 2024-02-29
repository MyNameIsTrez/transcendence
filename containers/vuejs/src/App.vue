<script setup lang="ts">
import PongCanvas from './components/PongCanvas.vue'
</script>

<template>
  <PongCanvas />
</template>

<style>
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

body {
  align-content: center;
  display: flex;
  margin: 0 auto;
  font-family: 'Press Start 2P', cursive;
}
</style>
