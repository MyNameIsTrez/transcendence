<template>
  <!-- <div class="flex flex-col overflow-hidden w-full lg:flex-row">
    <div
      class="grid flex-grow w-96 h-screen overflow-auto no-scrollbar bg-base-300 rounded-box place-items-stretch"
    >
      <Sidebar />
    </div>
    <div class="grid h-screen card bg-base-300 rounded-box place-items-center">
      <PongCanvas />
    </div>
    <div class="grid flex-grow w-96 h-screen card bg-base-300 rounded-box place-items-stretch">
      <Chat />
    </div>
  </div>
  <GameHeader /> -->

  <!-- RouterView is required to have route components like LoginView be rendered -->
  <RouterView />
</template>

<script setup lang="ts">
// import GameHeader from './components/GameHeader.vue'
// import PongCanvas from './components/PongCanvas.vue'
// import Sidebar from './components/Sidebar.vue'
// import Chat from './components/Chat.vue'

import { useRouter } from 'vue-router'

const router = useRouter()

const urlParams = new URLSearchParams(window.location.search)
const jwt = urlParams.get('jwt')
if (jwt) {
  localStorage.setItem('jwt', jwt)
}

router.replace({ path: '/' }) // Trims the jwt parameter from the URL
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
