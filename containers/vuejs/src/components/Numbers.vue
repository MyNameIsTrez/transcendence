<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const charPixel = 10
const digit = ref<number>(0)

const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  drawNumber()
})

watch(digit, () => {
  drawNumber()
})

const drawNumber = () => {
  const canvas = canvasRef.value
  if (canvas) {
    const context = canvas.getContext('2d')
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height)
      const numberPattern = getNumberPattern(digit.value)
      numberPattern.split('').forEach((fill, i) => {
        if (fill === '1') {
          context.fillRect((i % 3) * charPixel, Math.floor(i / 3) * charPixel, charPixel, charPixel)
        }
      })
    }
  }
}

const getNumberPattern = (num: number): string => {
  const numberPatterns = [
    '111101101101111', // 0
    '010010010010010', // 1
    '111001111100111', // 2
    '111001111001111', // 3
    '101101111001001', // 4
    '111100111001111', // 5
    '111100111101111', // 6
    '111001001001001', // 7
    '111101111101111', // 8
    '111101111001111' // 9
  ]
  return numberPatterns[num]
}
</script>
