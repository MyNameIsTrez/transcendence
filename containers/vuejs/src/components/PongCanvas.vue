<template>
  <canvas ref="canvasRef"></canvas>
  <div class="play-button-container">
    <button class="play-button" @click="joinMatch">PLAY</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { setupSocketManager } from './SocketManager'

const server_window_height = 1080
const server_window_width = 1920

const aspectRatio = server_window_width / server_window_height
let scale: number
const canvasRef = ref(null)
let canvas: HTMLCanvasElement | undefined
let context: CanvasRenderingContext2D | null

const drawObject = (
  color: string,
  obj: { pos: { x: number; y: number }; size: { w: number; h: number } }
) => {
  if (context) {
    context.fillStyle = color
    context.fillRect(obj.pos.x * scale, obj.pos.y * scale, obj.size.w * scale, obj.size.h * scale)
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
    scale = canvas.width / server_window_width
  }
}
</script>
<style>
.pong-container {
  display: flex;
  margin-right: auto;
  margin-left: auto;
  flex-direction: column;
}
.play-button-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.play-button {
  background-color: white;
  color: black;
  padding: 32px 64px;
  border: none;
  font-size: 32px;
  font-family: 'Press Start 2P', cursive;
  cursor: pointer;
  transition: background-color 0.3s;
}
.play-button:hover {
  background-color: #333; /* Darker shade on hover */
}

body {
  align-content: center;
  display: flex;
  margin: 0 auto;
  overflow: hidden;
}
canvas {
  border-top: 10px solid blue;
  border-bottom: 10px solid blue;
  image-rendering: pixelated;
  background-color: black;
}
#opponent-disconnected-message {
  opacity: 1;
  background-color: red;
  border: 3px;
  padding-left: auto;
  padding-right: auto;
  margin: auto;
  font-size: 20px;
  padding: 5px;
  border-style: solid;
  border-width: 3px;
}
#start-button {
  border: 1;
  font-size: 60px;
  background-color: lightskyblue;
  color: rgb(0, 0, 0);
  width: auto;
  margin-right: auto;
  margin-left: auto;
}
#stop-button {
  border: 1;
  font-size: 60px;
  background-color: coral;
  color: rgb(0, 0, 0);
  width: auto;
  margin-right: auto;
  margin-left: auto;
}
.center-button {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>
