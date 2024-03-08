<template>
  <div class="game-header" v-if="!startOfGame.value">
    <h1 class="game-title">{{ gameTitle }}</h1>
    <PlayButton />
  </div>
</template>
<script setup lang="ts">
import PlayButton from './PlayButton.vue'
import { getSocketIOInstance } from './SocketManager'
import { ref } from 'vue'
const gameTitle = ref('PONG')
const endOfGame = ref(false)
const startOfGame = ref(false)
const socketIOGame = getSocketIOInstance('game')

socketIOGame.on('gameOver', (data) => {
  console.log('Game over', data)
  endOfGame.value = true
  startOfGame.value = false
  if (data.won) {
    gameTitle.value = 'YOU WON'
  } else {
    gameTitle.value = 'YOU LOST'
  }
})
socketIOGame.on('gameStart', () => {
  console.log('Game start')
  startOfGame.value = true
})
</script>
<style>
.game-header {
  background-color: black;
  color: white;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  justify-content: center;
}
.game-title {
  font-size: 6vw;
  margin: 1vw;
  padding: 1vw;
}
</style>
