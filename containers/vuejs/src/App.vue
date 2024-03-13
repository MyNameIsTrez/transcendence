<script setup lang="ts">
import { onUnmounted } from 'vue'
import PongCanvas from './components/PongCanvas.vue'
import { disconnectSockets } from './components/SocketManager'
import Sidebar from './components/Sidebar.vue'

onUnmounted(() => {
  disconnectSockets()
})
</script>

<template>
  <Sidebar />
  <PongCanvas />
  <Sidebar />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  font-family: 'Press Start 2P', cursive;
}
</style>
