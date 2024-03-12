<template>
  <div class="pong-container" ref="pongContainer">
    <ScoreBoard />
    <GameHeader />
    <canvas id="pong-canvas" ref="canvasRef"> </canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSocketIOInstance } from './SocketManager'
import GameHeader from './GameHeader.vue'

const socketIOGame = getSocketIOInstance('game')

socketIOGame.on('pong', (data) => {
  render(data)
})
socketIOGame.on('gameOver', (data) => {
  drawCanvas()
})
const emitMovePaddle = (code: string, keydown: boolean) => {
  let north: boolean | undefined
  if (code === 'KeyW' || code === 'ArrowUp') {
    north = true
  } else if (code === 'KeyS' || code === 'ArrowDown') {
    north = false
  }
  if (north !== undefined) {
    socketIOGame.emit('movePaddle', { keydown: keydown, north: north })
  }
}
const server_window_height = 1080
const server_window_width = 1920
const pongContainer = ref(null)
const scale = ref(1)
const aspectRatio = server_window_width / server_window_height
const canvasRef = ref(null)
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

const drawCanvas = () => {
  resizeCanvas()
  if (context && canvas) {
    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
}

const resizeCanvas = () => {
  const screenWidth = (window.innerWidth * 6) / 8
  const screenHeight = (window.innerHeight * 6) / 8

  if (canvas) {
    if (screenWidth / screenHeight > aspectRatio) {
      canvas.width = screenHeight * aspectRatio
      canvas.height = screenHeight
    } else {
      canvas.width = screenWidth
      canvas.height = screenWidth / aspectRatio
    }
    scale.value = canvas.width / server_window_width
  }
}
</script>
<style>
.pong-container {
  flex-grow: 6;
  position: relative;
}
</style>
