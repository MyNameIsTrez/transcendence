<template>
  <div>
    <!-- You can use $refs to access the canvas elements -->
    <canvas ref="numberCanvas" v-for="(number, index) in numbers" :key="index" :height="char_pixel * 5" :width="char_pixel * 3"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      char_pixel: 10,
      numbers: [] as HTMLCanvasElement[]
    };
  },
  created() {
    this.initNumbers();
  },
  methods: {
    initNumbers() {
      this.numbers = [
        '111101101101111',
        '010010010010010',
        '111001111100111',
        '111001111001111',
        '101101111001001',
        '111100111001111',
        '111100111101111',
        '111001001001001',
        '111101111101111',
        '111101111001111',
      ].map((str) => {
        const canvas = document.createElement('canvas');
        canvas.height = this.char_pixel * 5;
        canvas.width = this.char_pixel * 3;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = 'white';
          str.split('').forEach((fill, i) => {
            if (fill === '1') {
              context.fillRect(
                (i % 3) * this.char_pixel,
                Math.floor(i / 3) * this.char_pixel,
                this.char_pixel,
                this.char_pixel,
              );
            }
          });
        }
        return canvas;
      });
    }
  }
});
</script>
