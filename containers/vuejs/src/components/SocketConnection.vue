<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    connectToGame() {
      const socket = io('http://localhost:4242');
			console.log(socket);
      if (socket) {
        socket.on('connect', () => {
          console.log('Connected');
          // Additional initialization logic if needed
        });

        socket.on('pong', (data) => {
          this.$emit('pong-data', data); // Emitting the data to parent component
        });

        socket.on('disconnect', () => {
          console.log('Disconnected');
          // Additional disconnection handling if needed
        });

        // Attach event listeners
        document.addEventListener('keydown', (event) => {
          const keyName = event.key;
          console.log(keyName);
          socket.emit('pressed', keyName);
        });

        document.addEventListener('keyup', (event) => {
          const keyName = event.key;
          console.log(keyName);
          socket.emit('released', keyName);
        });
      }
    }
  },
  mounted() {
    this.connectToGame();
  },
  beforeUnmount() {
    this.disconnectFromGame();
  },
});
</script>
