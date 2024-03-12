<template>
  <canvas ref="canvasRef"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Numbers from './Numbers.vue'
import { getSocketIOInstance } from './SocketManager'

const canvasRef = ref(null)

let numbersInstance = null
onMounted(() => {
  numbersInstance = new Numbers(canvasRef.value.width / 2, 50)
})

const updateScore = (leftScore: number, rightScore: number) => {
  const context = canvasRef.value.getContext('2d')
  drawScore(context, leftScore, 0)
  drawScore(context, rightScore, 1)
}

const drawScore = (context, score: number, i: number) => {
  const CHAR_W = Numbers.charPixel * 4
  const align = canvasRef.value.width / 3
  const chars = score.toString().split('')
  const offset = align * (i + 1) - CHAR_W * (chars.length / 2) + Numbers.charPixel / 2
  chars.forEach((char, pos) => {
    context.drawImage(numbersInstance._numbers[char | 0], offset + pos * CHAR_W, 20)
  })
}

getSocketIOInstance('game').on('pong', (data: any) => {
  updateScore(data.leftPlayer.score, data.rightPlayer.score)
})
</script>
