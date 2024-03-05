<template>
  <PlayButton :scale="scale" @joinMatch="joinMatch" />
  <div class="pong-container" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }">
    <canvas id="pong-canvas" ref="canvasRef"> </canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { setupSocketManager } from './SocketManager'
import PlayButton from './PlayButton.vue'

const server_window_height = 1080
const server_window_width = 1920

const aspectRatio = server_window_width / server_window_height
let scale: number = ref(1)
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

const { joinMatch, disconnect, emitMovePaddle } = setupSocketManager(render)

onMounted(() => {
  window.addEventListener('resize', drawCanvas) //TODO: replace with render to redraw all objects with correct size

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

onUnmounted(() => {
  disconnect()
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
