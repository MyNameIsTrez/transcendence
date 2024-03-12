<template>
  <button class="play-button" @click="emit('clicked')">
    {{ props.buttonText }}
  </button>
</template>
<script setup lang="ts">
import { ref, defineProps, computed } from 'vue'
import { getSocketIOInstance } from './SocketManager'

import { useRoute } from 'vue-router'
import { watch } from 'vue'

const route = useRoute()

let socketIOGame: SocketIOClient.Socket | undefined

// TODO: Move this to a logical file, and figure out a way to do this without watch()
watch(
  () => route.query.code,
  (code) => {
    if (code && socketIOGame === undefined) {
      // TODO: Only call this when we return from a Login button, and if we have a query code
      // TODO: This is an extremely shitty solution, since there's a race condition caused by
      // TODO: PlayButton.vue also calling this function, so PLEASE think of something better :((
      // TODO: Can the socketIOGame not just be a global?
      socketIOGame = getSocketIOInstance('game')
      console.log(`code: ${code}`)
    }
  }
)

const joinGame = () => {
  console.log('Joining game')
  socketIOGame.emit('joinGame')
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
