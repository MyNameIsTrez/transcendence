<template>
  <div class="game-header" v-if="!startOfGame">
    <h1 class="game-title">{{ gameTitle }}</h1>
    <PlayButton v-if="!endOfGame && !queueing" @clicked="joinGame" :buttonText="'PLAY'" />

    <p v-if="!endOfGame && queueing">Seeking {{ gamemode }} game...</p>

    <!-- TODO: Make the button prettier -->
    <form v-if="!endOfGame && !queueing" class="max-w-sm mx-auto">
      <select
        id="gamemode"
        v-model="gamemode"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option selected value="normal">Normal game</option>
        <option value="special">Special game</option>
      </select>
    </form>

    <PlayButton v-if="endOfGame" @clicked="reset" :buttonText="'Continue'" />
  </div>
</template>

<script setup lang="ts">
import PlayButton from './PlayButton.vue'
import { ref } from 'vue'

const props = defineProps(['gameSocket'])
const gameSocket = props.gameSocket

const emit = defineEmits(['resetCanvas'])
const gameTitle = ref('PONG')
const endOfGame = ref(false)
const startOfGame = ref(false)
const queueing = ref(false)

const gamemode = ref('normal')

const joinGame = () => {
  queueing.value = true
  gameSocket.emit('joinGame', { gamemode: gamemode.value })
}
const reset = () => {
  gameTitle.value = 'PONG'
  endOfGame.value = false
  startOfGame.value = false
  queueing.value = false
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
  user-select: none; /* Disables cursor selection */
}
</style>
