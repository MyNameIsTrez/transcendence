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
import { chatSocket } from './getSocket'

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
      // console.log(`Connected with id: ${chatSocket.id}`)
    })

    chatSocket.on('newMessage', (message) => {
      this.messages.push(message)
    })
  },
  methods: {
    sendMessage() {
      const message = {
        content: this.typedMessage,
        sender: chatSocket.id,
        recipient: this.recipient
      }

      this.messages = []

      chatSocket.emit('sendMessage', message)
      this.typedMessage = ''
    }
  }
}
</script>

<style scoped>
.chat-container {
  flex-grow: 1;
  position: relative;
}
</style>
