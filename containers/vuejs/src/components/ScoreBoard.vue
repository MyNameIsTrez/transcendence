<template>
  <div v-if="startGame" class="score-board">
    {{ leftPlayerScore }}
    <span> - </span>
    {{ rightPlayerScore }}
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { Socket } from 'socket.io-client'

const gameSocket: Socket = inject('gameSocket')!

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
  leftPlayerScore.value = data.score.leftPlayer
  rightPlayerScore.value = data.score.rightPlayer
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
  pointer-events: none; /* Makes the cursor select the canvas behind it */
}
</style>
