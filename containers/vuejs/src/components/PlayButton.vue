<template>
  <button class="play-button" @click="emit('clicked')">
    {{ props.buttonText }}
  </button>
</template>
<script setup lang="ts">
import { ref, defineProps } from 'vue'
import { gameSocket } from './SocketManager'

const joinGame = () => {
  console.log('Joining game')
  gameSocket.emit('joinGame')
}
const displayText = ref('PLAY')

const emit = defineEmits(['clicked'])
const props = defineProps({
  buttonText: String
})
console.log(props)
</script>
<style>
.play-button {
  background-color: white;
  color: black;
  text-align: center;
  font-size: 1vw;
  padding: 1.5vw 3vw;
  margin: 6vw;
}
.play-button:hover {
  background-color: #333; /* Darker shade on hover */
}
</style>
