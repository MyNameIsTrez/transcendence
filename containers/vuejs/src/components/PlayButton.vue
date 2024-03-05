<template>
  <div>
    <h1 class="title">PONG</h1>
  </div>
  <button
    class="play-button"
    @click="$emit('joinGame'), [changeText()]"
    :style="{
      'font-size': fontScale,
      padding: paddingScale
    }"
  >
    {{ displayText }}
  </button>
</template>
<script setup lang="ts">
import { ref, defineProps, computed } from 'vue'
const displayText = ref('PLAY')

const props = defineProps({
  scale: Number
})
const changeText = () => {
  displayText.value = 'Seeking adversary ...'
}

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
