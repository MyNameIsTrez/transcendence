<template>
  <div class="game-header" v-if="!startOfGame">
    <h1 class="game-title">{{ gameTitle }}</h1>
    <!-- <PlayButton v-if="!loggedIn" @clicked="attemptLogin" :buttonText="`LOGIN`" /> -->
    <PlayButton v-if="!endOfGame" @clicked="joinGame" :buttonText="buttonText" />
    <PlayButton v-if="endOfGame" @clicked="reset" :buttonText="`Continue`" />
  </div>
</template>

<script setup lang="ts">
import PlayButton from './PlayButton.vue'
import { ref } from 'vue'

const props = defineProps(['gameSocket'])
const gameSocket = props.gameSocket

const emit = defineEmits(['resetCanvas'])
const gameTitle = ref('PONG')
const buttonText = ref('PLAY')
const endOfGame = ref(false)
const startOfGame = ref(false)

const joinGame = () => {
  buttonText.value = 'Seeking game...'
  gameSocket.emit('joinGame', { mode: 'normal' })
}
const reset = () => {
  buttonText.value = 'PLAY'
  gameTitle.value = 'PONG'
  endOfGame.value = false
  startOfGame.value = false
  emit('resetCanvas')
}

gameSocket.on('gameOver', (won: boolean) => {
  endOfGame.value = true
  startOfGame.value = false
  gameTitle.value = won ? 'YOU WON' : 'YOU LOST'
})
gameSocket.on('gameStart', () => {
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
  font-size: 4vw;
  margin: 1vw;
  padding: 1vw;
}
</style>
