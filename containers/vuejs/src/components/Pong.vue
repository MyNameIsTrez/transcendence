<template>
  <div>
    <canvas ref="pongCanvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ScoreBoard from './ScoreBoard.vue';

const WINDOW_WIDTH = 1920;
const WINDOW_HEIGHT = 1080;

export default defineComponent({
  components: {
    ScoreBoard
  },
  mounted() {
    this.initCanvas();
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.pongCanvas as HTMLCanvasElement;
      canvas.width = WINDOW_WIDTH;
      canvas.height = WINDOW_HEIGHT;
      const context = canvas.getContext('2d');
      if (context) {
        this._context = context;
        this.drawCanvas();
        // Initialize other components or event listeners here if needed
      }
    },
    drawObject(color: string, obj: { pos: { x: number; y: number }; size: { w: number; h: number } }) {
      if (this._context) {
        this._context.fillStyle = color;
        this._context.fillRect(obj.pos.x, obj.pos.y, obj.size.w, obj.size.h);
      }
    },
    drawCanvas() {
      if (this._context) {
        this._context.fillStyle = 'black';
        this._context.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
      }
    },
    render(data: { ball: any; leftPlayer: { paddle: any; score: number }; rightPlayer: { paddle: any; score: number } }) {
      this.drawCanvas();
      this.drawObject('white', data.ball);
      this.drawObject('white', data.leftPlayer.paddle);
      this.drawObject('white', data.rightPlayer.paddle);
      this.$refs.scoreBoard.updateScore(data.leftPlayer.score, data.rightPlayer.score);
    },
    start() {
      // Implement the start logic if needed
    }
  }
});
</script>

<style>
/* Add styles if needed */
</style>
