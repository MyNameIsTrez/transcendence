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
  const context = canvas.getContext('2d')
  if (context) {
    _context.value = context
    drawCanvas()
  }
}

function emitMovePaddle(code: string, keydown: boolean) {
  var north
  if (code === 'KeyW' || code === 'ArrowUp') {
    north = true
  } else if (code === 'KeyS' || code === 'ArrowDown') {
    north = false
  }

  if (north !== undefined) {
    socket.emit('movePaddle', { keydown: keydown, north: north })
  }
}

function drawObject(
  color: string,
  obj: { pos: { x: number; y: number }; size: { w: number; h: number } }
) {
  if (_context.value) {
    _context.value.fillStyle = color
    _context.value.fillRect(obj.pos.x, obj.pos.y, obj.size.w, obj.size.h)
  }
}

function drawCanvas() {
  if (_context.value) {
    _context.value.fillStyle = 'black'
    _context.value.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT)
  }
}

function render(data: {
  ball: any
  leftPlayer: { paddle: any; score: number }
  rightPlayer: { paddle: any; score: number }
}) {
  drawCanvas()
  drawObject('white', data.ball)
  drawObject('white', data.leftPlayer.paddle)
  drawObject('white', data.rightPlayer.paddle)
  // this.$refs.scoreBoard.updateScore(data.leftPlayer.score, data.rightPlayer.score);
}
</script>
