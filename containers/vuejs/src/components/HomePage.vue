<script setup lang="ts">
import Chat from './Chat.vue'
import GameHeader from './GameHeader.vue'
import PongCanvas from './PongCanvas.vue'
import Sidebar from './Sidebar.vue'
import { useRouter } from 'vue-router'

function extractJwtFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  const jwt = urlParams.get('jwt')
  if (jwt) {
    localStorage.setItem('jwt', jwt)
  }
  router.replace({ path: '/' }) // Trims the jwt parameter from the URL
}

const router = useRouter()

extractJwtFromUrl()
</script>

<template>
  <div class="flex flex-col overflow-hidden w-full lg:flex-row">
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
  <GameHeader />
</template>
