<template>
  <div>
    <div v-for="msg in messages" :key="msg.id">
      <strong>{{ msg.sender }}:</strong> {{ msg.content }}
    </div>
    <input v-model="typedMessage" placeholder="Type your message..." />
    <button @click="sendMessage">Send</button>
  </div>
</template>

<script>
import io from 'socket.io-client';
import { getSocketIOInstance } from './SocketManager';
  
  export default {
    data() {
      return {
        typedMessage: '',
        messages: [],
        socket: null,
        recipient: 'other-client-id', // Replace with the recipient's client id
      };
    },
    mounted() {
      this.socket = getSocketIOInstance('chat');
  
      this.socket.on('connect', () => {
        console.log(`Connected with id: ${this.socket.id}`);
      });
  
      this.socket.on('newMessage', (message) => {
        this.messages.push(message);
      });
    },
    methods: {
      sendMessage() {
        const message = {
          content: this.typedMessage,
          sender: this.socket.id,
          recipient: this.recipient,
        };
        
        this.messages = [];

        this.socket.emit('sendMessage', message);
        this.typedMessage = '';
      },
    },
  };
  </script>
  
  <style scoped>
  .chat-container {
    flex-grow: 1;
    position: relative;
  }
  </style>
  