<template>
  <div class="game-header" v-if="!startOfGame">
    <h1 class="game-title">{{ gameTitle }}</h1>
    <PlayButton v-if="!endOfGame" @clicked="joinGame" :buttonText="buttonText" />
    <PlayButton v-if="endOfGame" @clicked="reset" :buttonText="buttonText" />
  </div>
</template>
<script setup lang="ts">
import PlayButton from './PlayButton.vue'
import { getSocketIOInstance } from './SocketManager'
import { ref } from 'vue'
const emit = defineEmits(['resetCanvas'])
const gameTitle = ref('PONG')
const buttonText = ref('PLAY')
const endOfGame = ref(false)
const startOfGame = ref(false)
const socketIOGame = getSocketIOInstance('game')

const joinGame = () => {
  buttonText.value = 'Seeking game...'
  socketIOGame.emit('joinGame')
}
const reset = () => {
  buttonText.value = 'PLAY'
  gameTitle.value = 'PONG'
  endOfGame.value = false
  startOfGame.value = false
  emit('resetCanvas')
}

socketIOGame.on('gameOver', (data) => {
  console.log('Game over', data)
  endOfGame.value = true
  startOfGame.value = false
  buttonText.value = 'Continue'
  if (data.won) {
    gameTitle.value = 'YOU WON'
  } else {
    gameTitle.value = 'YOU LOST'
  }
})
socketIOGame.on('gameStart', () => {
  startOfGame.value = true
})
</script>
<style>
.game-header {
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
