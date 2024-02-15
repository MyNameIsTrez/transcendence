<script setup lang="ts">
import Pong from './components/Pong.vue'
import Sidebar from './components/Sidebar.vue'
</script>

<template>
	<Sidebar />
	<Pong />
</template>

<style scoped>

#app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

</style>
