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
import { getSocketIOInstance, disconnectSocketIO } from './components/SocketManager'
import Sidebar from './components/Sidebar.vue'
import Chat from './components/Chat.vue'
const loggedIn = ref(false)
onBeforeMount(() => {
  const root = getSocketIOInstance('/')
  const code = new URLSearchParams(window.location.search).get('code') || ''
  root.on('attemptLogin', (loggedIn: boolean) => {
    loggedIn.value = loggedIn
  })
  root.emit('code', code)
})

onUnmounted(() => {
  disconnectSocketIO('/')
  disconnectSocketIO('game')
  disconnectSocketIO('chat')
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
