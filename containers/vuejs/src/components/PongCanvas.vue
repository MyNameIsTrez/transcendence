<template>
  <PlayButton :scale="scale" />
  <div class="pong-container" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }">
    <canvas id="pong-canvas" ref="canvasRef"> </canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { getSocketIOInstance } from './SocketManager'
import PlayButton from './PlayButton.vue'

import { useRoute } from 'vue-router'
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
      console.log('b')

      socketIOGame.on('pong', (data) => {
        render(data)
      })
      socketIOGame.on('gameOver', (data) => {
        console.log('Game over', data)
      })

      console.log(`code: ${code}`)
      socketIOGame.emit('code', { code })
    }
  }
)

const emitMovePaddle = (code: string, keydown: boolean) => {
  let north: boolean | undefined
  if (code === 'KeyW' || code === 'ArrowUp') {
    north = true
  } else if (code === 'KeyS' || code === 'ArrowDown') {
    north = false
  }
  if (north !== undefined && socketIOGame !== undefined) {
    socketIOGame.emit('movePaddle', { keydown: keydown, north: north })
  }
}
const server_window_height = 1080
const server_window_width = 1920

const scale = ref(1)
const aspectRatio = server_window_width / server_window_height
const canvasRef = ref(null)
const canvasWidth = ref(server_window_width)
const canvasHeight = ref(server_window_height)
let canvas: HTMLCanvasElement | undefined
let context: CanvasRenderingContext2D | null

const drawObject = (
  color: string,
  obj: { pos: { x: number; y: number }; size: { w: number; h: number } }
) => {
  if (context) {
    context.fillStyle = color
    context.fillRect(
      obj.pos.x * scale.value,
      obj.pos.y * scale.value,
      obj.size.w * scale.value,
      obj.size.h * scale.value
    )
  }
}
// TODO: Replace "any" with Data struct typedef?
const render = (data: {
  ball: any
  leftPlayer: { paddle: any; score: number }
  rightPlayer: { paddle: any; score: number }
}) => {
  drawCanvas()
  drawObject('white', data.ball)
  drawObject('white', data.leftPlayer.paddle)
  drawObject('white', data.rightPlayer.paddle)
}

onMounted(() => {
  window.addEventListener('resize', drawCanvas) // TODO: replace with render to redraw all objects with correct size

  if (canvasRef.value) {
    canvas = canvasRef.value as HTMLCanvasElement
    context = canvas.getContext('2d')

    canvas.tabIndex = 1 // make element focusable, so that addEventListener can be used
    canvas.addEventListener('keydown', (event) => {
      emitMovePaddle(event.code, true)
    })
    canvas.addEventListener('keyup', (event) => {
      emitMovePaddle(event.code, false)
    })
  }

  drawCanvas()
})

const drawCanvas = () => {
  resizeCanvas()
  if (context && canvas) {
    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
}

const resizeCanvas = () => {
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight

  if (canvas) {
    if (screenWidth / screenHeight > aspectRatio) {
      canvas.width = screenHeight * aspectRatio
      canvas.height = screenHeight
    } else {
      canvas.width = screenWidth
      canvas.height = screenWidth / aspectRatio
    }
    scale.value = canvas.width / server_window_width
    canvasWidth.value = canvas.width
    canvasHeight.value = canvas.height
  }
}
</script>
<style>
.pong-container {
  display: relative;
  align-content: center;
}
</style>
