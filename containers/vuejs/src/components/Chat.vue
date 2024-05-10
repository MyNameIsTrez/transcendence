<template>
  <div>
    <!-- createChat -->
    <input v-model="chatName" placeholder="Chat name..." @keyup.enter="createChat" />
    <button @click="createChat">Create</button>
    <button @click="joinChat">Join chat</button>
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
import { get, post } from '../httpRequests'

const chatName = ref('')

async function createChat() {
  const chat = await post('chat/create', {
    name: chatName.value,
    visibility: 'PROTECTED',
    password: 'foo'
  })
  console.log('chat', chat)
  getMyChats()
}

async function joinChat() {
  // TODO: Replace this hardcoded chat_id and password
  const chat_id = '36c54d23-7c33-4f0d-ab82-7b1582ba0e3c'
  const password = 'foo'

  const joined = await post('chat/join', { chat_id, password })
  console.log('joined', joined)
}

const myChats = ref('')

async function getMyChats() {
  myChats.value = await get('user/myChats')
  // console.log('myChats', typeof myChats.value, myChats.value)
}

getMyChats()
</script>

<style scoped>
.chat-container {
  flex-grow: 1;
  position: relative;
}
</style>
