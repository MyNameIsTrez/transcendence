<template>
  <div class="pong-container">
    <canvas ref="canvasRef"></canvas>
    <div class="start-button-container">
      <button class="start-button" @click="connect">PLAY</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { setupGameSocket } from './GameSocket.ts'

const WINDOW_WIDTH = 1920
const WINDOW_HEIGHT = 1080
const canvasRef = ref(null)

const render = (data: {
  ball: any
  leftPlayer: { paddle: any; score: number }
  rightPlayer: { paddle: any; score: number }
}) => {
  drawCanvas()
  drawObject('white', data.ball)
  drawObject('white', data.leftPlayer.paddle)
  drawObject('white', data.rightPlayer.paddle)
  // this.$refs.scoreBoard.updateScore(data.leftPlayer.score, data.rightPlayer.score);
}
const { connect, disconnect, emitMovePaddle } = setupGameSocket(render)

onMounted(() => {
  initCanvas()
})
onUnmounted(() => {
  disconnect()
})
function initCanvas() {
  const canvas = canvasRef.value
  canvas.tabIndex = 1 // make element focusable, so that addEventListener can be used
  canvas.addEventListener('keydown', (event) => {
    emitMovePaddle(event.code, true)
  })
  canvas.addEventListener('keyup', (event) => {
    emitMovePaddle(event.code, false)
  })
  canvas.width = WINDOW_WIDTH
  canvas.height = WINDOW_HEIGHT
  drawCanvas()
}

function drawObject(
  color: string,
  obj: { pos: { x: number; y: number }; size: { w: number; h: number } }
) {
  const canvas = canvasRef.value
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = color
    context.fillRect(obj.pos.x, obj.pos.y, obj.size.w, obj.size.h)
  }
}

function drawCanvas() {
  const canvas = canvasRef.value
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = 'black'
    context.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT)
  }
}
</script>
<style>
.pong-container {
}
.start-button-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.start-button {
  background-color: white;
  color: black;
  padding: 40px 80px;
  border: none;
  font-size: 32px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  transition: background-color 0.3s;
}
.start-button:hover {
  background-color: #333; /* Darker shade on hover */
}
</style>
