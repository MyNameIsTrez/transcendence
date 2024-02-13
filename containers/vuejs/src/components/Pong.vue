<template>
  <div>
    <canvas ref="pongCanvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ScoreBoard from './ScoreBoard.vue';
import io from 'socket.io-client';

const WINDOW_WIDTH = 1920;
const WINDOW_HEIGHT = 1080;

export default defineComponent({
  components: {
    ScoreBoard,
  },
  mounted() {
	this.socket = io('ws://localhost:4242');
	this.socket.on('pong', (data) => {
		this.render(data);
	});
    this.initCanvas();
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.pongCanvas as HTMLCanvasElement;
	  canvas.tabIndex = 1; // make element focusable, so that addEventListener can be used
	  canvas.addEventListener('keydown', (event) => {
	  	this.socket.emit('pressed', event.code);
	  });
	  canvas.addEventListener('keyup', (event) => {
	  	this.socket.emit('released', event.code);
	  });
      canvas.width = WINDOW_WIDTH;
      canvas.height = WINDOW_HEIGHT;
      const context = canvas.getContext('2d');
      if (context) {
        this._context = context;
        this.drawCanvas();
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
      // this.$refs.scoreBoard.updateScore(data.leftPlayer.score, data.rightPlayer.score);
    },
    start() {
    }
  }
});
</script>

<style>
/* Add styles if needed */
</style>
