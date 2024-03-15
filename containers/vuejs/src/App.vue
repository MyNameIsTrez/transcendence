<template>
  <GameHeader />
  <Sidebar v-if="loggedIn" />
  <PongCanvas v-if="loggedIn" />
  <Chat v-if="loggedIn" />
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onUnmounted } from 'vue'
import GameHeader from './components/GameHeader.vue'
import PongCanvas from './components/PongCanvas.vue'
import { rootSocket, disconnectSockets } from './components/SocketManager'
import Sidebar from './components/Sidebar.vue'
import Chat from './components/Chat.vue'
const loggedIn = ref(false)
onBeforeMount(() => {
  const code = new URLSearchParams(window.location.search).get('code') || ''
  console.log('code', code)
  rootSocket.on('attemptLogin', (success: boolean) => {
    loggedIn.value = success
  })
  rootSocket.emit('code', code)
})

onUnmounted(() => {
  disconnectSockets()
})
</script>

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
