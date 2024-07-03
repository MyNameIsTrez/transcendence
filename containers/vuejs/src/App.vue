<template>
  <AlertPopup ref="alertPopup" />

  <!-- Suspense is needed for the async get() requests we do -->
  <!-- RouterView is required to have route components like LoginView be rendered -->
  <Suspense>
    <RouterView />
  </Suspense>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import AlertPopup from './components/AlertPopup.vue'

const alertPopup = ref()
provide('alertPopup', alertPopup)
</script>

<style>
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  font-family: 'Press Start 2P', cursive;
}
</style>
