<template>
  <button
    class="play-button"
    @click="joinGame"
    :style="{
      top: topScale,
      left: leftScale,
      'font-size': fontScale,
      padding: paddingScale
    }"
  >
    PLAY
  </button>
</template>
<script setup lang="ts">
import { defineProps, computed } from 'vue'
const props = defineProps({
  joinGame: Function,
  scale: Number
})
const topScale = computed(() => {
  return `${props.scale * 45}%`
})
const leftScale = computed(() => {
  return `${props.scale * 70}%`
})
const fontScale = computed(() => {
  return `${props.scale * 2}vw`
})
const paddingScale = computed(() => {
  return `${props.scale * 2}vw ${props.scale * 4}vw`
})
</script>
<style>
.play-button {
  background-color: white;
  color: black;
  border: none;
  position: absolute;
  font-family: inherit;
}
.play-button:hover {
  background-color: #333; /* Darker shade on hover */
}
</style>
