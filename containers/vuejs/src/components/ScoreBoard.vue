<template>
  <div v-if="startGame" class="score-board select-none text-center text-white">
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
  margin: 1em;
  font-size: 1.5em;
}
</style>
