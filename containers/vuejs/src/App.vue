<script setup lang="ts">
import { onUnmounted } from 'vue'
import PongCanvas from './components/PongCanvas.vue'
import { disconnectSocketIO } from './components/SocketManager'
import Sidebar from './components/Sidebar.vue'

onUnmounted(() => {
  disconnectSocketIO('game')
})
</script>

<template>
  <Sidebar />
  <PongCanvas />
</template>

<style>
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: 'Press Start 2P', cursive;
}
</style>
