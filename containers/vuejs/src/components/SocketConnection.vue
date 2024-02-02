<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  mounted() {
    this.connectToGame();
  },
  methods: {
    connectToGame() {
      const socket = io('http://localhost:4242');
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
  beforeUnmount() {
    this.disconnectFromGame();
  },
  methods: {
    disconnectFromGame() {
      // Disconnect from the game
      // Cleanup any resources if needed
    }
  }
});
</script>
