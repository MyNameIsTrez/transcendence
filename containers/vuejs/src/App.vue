<template>
  <PongCanvas v-if="loggedIn" />
  <GameHeader />
  <Sidebar v-if="loggedIn" />
  <Chat v-if="loggedIn" />
  <!-- <div class="flex flex-col w-full lg:flex-row">
		<div class="grid flex-grow w-96 h-screen card bg-base-300 rounded-box place-items-stretch"><Sidebar /></div>
		<div class="grid h-screen card bg-base-300 rounded-box place-items-center"><PongCanvas /></div>
		<div class="grid flex-grow w-96 h-screen card bg-base-300 rounded-box place-items-stretch"><Filler /></div>
	</div> -->
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onUnmounted } from 'vue'
import GameHeader from './components/GameHeader.vue'
import PongCanvas from './components/PongCanvas.vue'
import { rootSocket, disconnectSockets } from './components/SocketManager'
import Sidebar from './components/Sidebar.vue'
import Filler from './components/Filler.vue'

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
