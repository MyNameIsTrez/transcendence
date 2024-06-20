<template>
  <div class="h-screen flex items-center">
    <div class="relative flex items-center">
      <canvas ref="canvasRef" class="w-full"> </canvas>
      <GameOverlay />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { Socket } from 'socket.io-client'
import GameOverlay from './GameOverlay.vue'

const gameSocket: Socket = inject('gameSocket')!
const userSocket: Socket = inject('userSocket')!

gameSocket.on('pong', (data: any) => {
  render(data)
})
gameSocket.on('gameOver', async () => {
  await drawCanvas()
})

setInterval(
  () => {
    userSocket.emit('heartbeat')
  },
  import.meta.env.VITE_HEARTBEAT_RATE_MS
)

const emitMovePaddle = (code: string, keydown: boolean) => {
  let north: boolean | undefined
  if (code === 'KeyW' || code === 'ArrowUp') {
    north = true
  } else if (code === 'KeyS' || code === 'ArrowDown') {
    north = false
  }
  if (north !== undefined) {
    gameSocket.emit('movePaddle', { keydown: keydown, north: north })
  }
}

const server_window_height = 1080
const server_window_width = 1920
const canvasRef = ref()
let canvas: HTMLCanvasElement | undefined
let context: CanvasRenderingContext2D | null

const drawObject = (
  color: string,
  obj: { pos: { x: number; y: number }; size: { w: number; h: number } }
) => {
  if (context) {
    context.fillStyle = color
    context.fillRect(obj.pos.x, obj.pos.y, obj.size.w, obj.size.h)
  }
}
// TODO: Replace "any" with Data struct typedef?
const render = async (data: { rects: Array<any>; score: any }) => {
  await drawCanvas()
  for (const rect of data.rects) {
    drawObject(rect.color, rect)
  }
}

onMounted(async () => {
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

    canvas.width = server_window_width
    canvas.height = server_window_height
  }

  await drawCanvas()
})

const drawCanvas = async () => {
  canvas = canvasRef.value as HTMLCanvasElement

  if (context && canvas) {
    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
}
</script>
