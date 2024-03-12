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

  <!-- <button class="btn btn-neutral">Neutral</button> -->
	<div class="flex flex-col w-full lg:flex-row">
	<div class="grid flex-grow h-32 card place-items-center"><Sidebar /></div>
	<!-- <Sidebar /> -->
	<!-- <div class="divider lg:divider-horizontal"></div> -->
	<div class="grid card bg-base-300 place-items-center"><PongCanvas /></div>
	<!-- <PongCanvas /> -->
	</div>
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
