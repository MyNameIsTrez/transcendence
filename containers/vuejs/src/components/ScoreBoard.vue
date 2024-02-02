<template>
  <div>
    <canvas ref="scoreCanvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import Numbers from './Numbers.vue';

export default defineComponent({
  props: {
    leftScore: Number,
    rightScore: Number
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement | null>(null);
    const context = ref<CanvasRenderingContext2D | null>(null);
    const numbers = new Numbers();
    let align = 0;
    let CHAR_W = 0;

    onMounted(() => {
      if (canvas.value) {
        context.value = canvas.value.getContext('2d');
        if (context.value) {
          align = canvas.value.width / 3;
          CHAR_W = numbers.char_pixel * 4;
        }
      }
    });

    watch([() => props.leftScore, () => props.rightScore], () => {
      if (context.value) {
        drawScore(props.leftScore, 0);
        drawScore(props.rightScore, 1);
      }
    });

    function drawScore(score: number, i: number) {
      const chars = score.toString().split('');
      const offset = align * (i + 1) - CHAR_W * (chars.length / 2) + numbers.char_pixel / 2;
      chars.forEach((char, pos) => {
        if (context.value) {
          context.value.drawImage(numbers.numbers[parseInt(char)], offset + pos * CHAR_W, 20);
        }
      });
    }

    return {
      canvas,
      context,
      numbers,
      align,
      CHAR_W,
      drawScore
    };
  }
});
</script>
