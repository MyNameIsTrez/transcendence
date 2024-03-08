<template>
  <button class="play-button" @click="[joinGame(), changeText()]">
    {{ displayText }}
  </button>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { getSocketIOInstance } from './SocketManager'
const socketIOGame = getSocketIOInstance('game')
const joinGame = () => {
  console.log('Joining game')
  socketIOGame.emit('joinGame')
}
const displayText = ref('PLAY')

const changeText = () => {
  displayText.value = 'Seeking match ...'
}
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
