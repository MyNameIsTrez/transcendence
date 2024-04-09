<template>
  <!-- RouterView is required to have route components like LoginView be rendered -->
  <RouterView />
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import { disconnectSockets } from './components/SocketManager'

onUnmounted(() => {
  disconnectSockets()
})
</script>

<!-- TODO: Is this still used? -->
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
