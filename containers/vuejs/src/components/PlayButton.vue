<template>
  <div>
    <h1 class="title">PONG</h1>
  </div>
  <button
    class="play-button"
    @click="[joinGame(), changeText()]"
    :style="{
      'font-size': fontScale,
      padding: paddingScale
    }"
  >
    {{ displayText }}
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

// const urlParams = new URLSearchParams(window.location.search);
// const code = urlParams.get('code');
// console.log(`code: ${code}`)

const joinGame = () => {
  console.log('Joining game')
  socketIOGame.emit('joinGame')
}
const displayText = ref('PLAY')

const props = defineProps({
  scale: Number
})
const changeText = () => {
  displayText.value = 'Seeking match ...'
}

const fontScale = computed(() => {
  return `${props.scale * 2}vw`
})
const paddingScale = computed(() => {
  return `${props.scale * 2}vw ${props.scale * 4}vw`
})
</script>
<style>
.play-button {
  background-color: white;
  color: black;
  border: none;
  position: absolute;
  font-family: inherit;
  text-align: center;
  margin: auto;
  display: flex;
  justify-content: center;
}
.play-button:hover {
  background-color: #333; /* Darker shade on hover */
}

.title {
  background-color: black;
  color: white;
  position: absolute;
  display: relative;
  align-content: center;
}
</style>
