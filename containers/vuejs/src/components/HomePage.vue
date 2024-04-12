<script setup lang="ts">
import Chat from './Chat.vue'
import GameHeader from './GameHeader.vue'
import PongCanvas from './PongCanvas.vue'
import Sidebar from './Sidebar.vue'
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
