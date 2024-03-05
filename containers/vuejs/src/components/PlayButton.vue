<template>
  <button
    class="play-button"
    @click="joinMatch"
    :style="{
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
  joinMatch: Function,
  scale: Number
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
  text-align: center;
  margin: auto;
  display: flex;
  justify-content: center;
}
.play-button:hover {
  background-color: #333; /* Darker shade on hover */
}
</style>
