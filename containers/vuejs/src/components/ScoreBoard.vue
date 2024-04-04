<template>
  <div v-if="startGame" class="score-board">
    {{ leftPlayerScore }}
    <span> - </span>
    {{ rightPlayerScore }}
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import gameSocket from './SocketManager.vue'
const leftPlayerScore = ref(0)
const rightPlayerScore = ref(0)
const startGame = ref(false)
gameSocket.on('gameOver', () => {
  leftPlayerScore.value = 0
  rightPlayerScore.value = 0
  startGame.value = false
})
gameSocket.on('gameStart', () => {
  startGame.value = true
})
gameSocket.on('pong', (data: any) => {
  leftPlayerScore.value = data.leftPlayer.score
  console.log('leftPlayerScore', leftPlayerScore.value)
  rightPlayerScore.value = data.rightPlayer.score
  console.log('rightPlayerScore', rightPlayerScore.value)
})
</script>

<style>
.score-board {
  position: absolute;
  top: 4vw;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2vw;
  color: white;
}
</style>
