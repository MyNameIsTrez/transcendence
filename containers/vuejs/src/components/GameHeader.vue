<style>
#game-header h1 {
  font-size: 3em !important;
}

#game-header select {
  font-size: 1em !important;
  padding: 0.625em;
  border-radius: 0.5em;
}

/* mimic tailwind's `spacing`, but with ems */
#game-header > :not([hidden]) ~ :not([hidden]) {
  --spacing: 1.5em;

  /* Don't worry about it */
  /* Here be dragons */
  --tw-space-y-reverse: 0;
  margin-top: calc(var(--spacing) * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(var(--spacing) * var(--tw-space-y-reverse));
}
</style>

<template>
  <div
    class="text-white w-full h-full flex flex-col justify-center items-center pointer-events-auto"
    id="game-header"
    v-if="!startOfGame"
  >
    <h1 class="select-none text-center">{{ gameTitle }}</h1>
    <PlayButton v-if="!endOfGame && !queueing" @clicked="joinGame" :buttonText="'PLAY'" />

    <p v-if="!endOfGame && queueing">Seeking {{ gamemode }} game...</p>

    <PlayButton v-if="!endOfGame && queueing" @clicked="leaveQueue" :buttonText="'Leave queue'" />

    <form v-if="!endOfGame && !queueing" class="max-w-sm mx-auto">
      <select
        v-model="gamemode"
        @change="updateGamemode"
        class="bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
import { inject, ref, type Ref } from 'vue'
import { Socket } from 'socket.io-client'
import AlertPopup from './AlertPopup.vue'

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!
const gameSocket: Socket = inject('gameSocket')!

const gameTitle = ref('PONG')
const endOfGame = ref(false)
const startOfGame = ref(false)
const queueing = ref(false)

if (!localStorage.getItem('gamemode')) {
  localStorage.setItem('gamemode', 'normal')
}

const gamemode = ref(localStorage.getItem('gamemode')!)

const updateGamemode = () => {
  localStorage.setItem('gamemode', gamemode.value)
}

const joinGame = () => {
  gameSocket.emit('queue', { gamemode: gamemode.value })
}

const leaveQueue = () => {
  gameSocket.emit('leaveQueue')
}

const reset = () => {
  gameTitle.value = 'PONG'
  endOfGame.value = false
  startOfGame.value = false
  queueing.value = false
}

gameSocket.on('gameOver', (won: boolean) => {
  endOfGame.value = true
  startOfGame.value = false
  gameTitle.value = won ? 'YOU WON' : 'YOU LOST'
})
gameSocket.on('gameStart', () => {
  startOfGame.value = true
})
gameSocket.on('inQueue', (data: any) => {
  reset()
  queueing.value = data.inQueue
})

gameSocket.on('exception', (error: any) => {
  alertPopup.value.showWarning(error.message)
})
</script>
