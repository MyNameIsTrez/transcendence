<template>
  <div>
    <!-- createChat -->
    <input v-model="chatName" placeholder="Chat name..." @keyup.enter="createChat" />
    <button @click="createChat">Create</button>
    <!-- <br /><br /> -->

    <!-- getChat -->
    <!-- <input v-model="typedQuery" placeholder="Chat name..." @keyup.enter="getChat" />
    <button @click="getChat">Search</button>
    <br /><br /> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { chatSocket } from '../getSocket'
import { post } from '../httpRequests'

const chatName = ref('')

async function createChat() {
  const chat = await post('chat/create', {
    name: chatName.value,
    visibility: 'PUBLIC'
  })
  console.log('chat', chat)
}
</script>

<style scoped>
.chat-container {
  flex-grow: 1;
  position: relative;
}
</style>
../getSocket
