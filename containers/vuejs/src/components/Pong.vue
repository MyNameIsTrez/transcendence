<template>
  <div>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import io from 'socket.io-client'

const WINDOW_WIDTH = 1920
const WINDOW_HEIGHT = 1080
const socket = io('ws://localhost:4242')
const canvasRef = ref(null)
let _context = ref(null)

onMounted(() => {
  socket.on('pong', (data) => {
    render(data)
    // console.log('received pong:', data)
  })
  initCanvas()
})

onUnmounted(() => {
  socket.disconnect();
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
