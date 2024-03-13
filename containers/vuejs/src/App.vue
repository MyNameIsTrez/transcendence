<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import PongCanvas from './components/PongCanvas.vue'
import { disconnectSocketIO } from './components/SocketManager'
import Sidebar from './components/Sidebar.vue'
import Chat from './components/Chat.vue'


onUnmounted(() => {
  disconnectSocketIO('game')
  disconnectSocketIO('chat')
})
</script>

<template>
  <Sidebar />
  <PongCanvas />
  <Chat />
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
