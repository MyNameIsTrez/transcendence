<template>
  <div>
    <button @click="newChat">Create chat&nbsp</button>
    <input v-model="typedNewChat" placeholder="New chat name..." @keyup.enter="newChat" />
    <br /><br />
    <button @click="searchChat">Search for chat&nbsp</button>
    <input v-model="typedSearch" placeholder="Chat name..." @keyup.enter="searchChat" />
    <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
    <div v-for="msg in messages" :key="msg.id">
      <strong>{{ msg.sender }}</strong> {{ msg.content }}
    </div>
    <br />
    <input v-model="typedMessage" placeholder="Type your message..." @keyup.enter="sendMessage" />
    <button @click="sendMessage">Send</button>
  </div>
</template>

<script>

import { chatSocket } from './SocketManager'
import axios from 'axios';

export default {
  data() {
    return {
      typedMessage: '',
      messages: [],
      recipient: 'other-client-id' // Replace with the recipient's client id
    }
  },
  mounted() {
    chatSocket.on('connect', () => {
      console.log(`Connected with id: ${chatSocket.id}`)
    })

    chatSocket.on('newMessage', (message) => {
      this.messages.push(message)
    })
  },
  methods: {
    sendMessage() {
      const message = {
        content: this.typedMessage,
        sender: chatSocket.id, // is maybe redundant
        recipient: this.recipient
      }

      this.messages = []

      chatSocket.emit('sendMessage', message)
      this.typedMessage = ''
    },
    // new
    async searchChat() {
      const search = {
        content: this.typedSearch,
        sender: chatSocket.id, // is maybe redundant
        recipient: this.recipient
      }
      console.log(`typedSearch: ${this.typedSearch}`)
      try {
        const response = await axios.get(`http://localhost:3000/chat/messages?channelName=${this.typedSearch}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching chat messages:', error);
        return { error: 'Error fetching chat messages' };
      }
    }
  //   async searchChat() {
  //     try {
  //       const response = await axios.get(`http://localhost:3000/chat/messages?channelName=${typedSearch}`);
  //       return response.data;
  //     } catch (error) {
  //       console.error('Error fetching chat messages:', error);
  //       return { error: 'Error fetching chat messages' };
  //     }
  // }
}
}
</script>

<style scoped>
.chat-container {
  flex-grow: 1;
  position: relative;
}
</style>
