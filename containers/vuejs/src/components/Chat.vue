<template>
  <div>
    <!-- Chats -->
    <div>>> CHATS <<</div>
    <div v-for="chat in chatsOnIndex">
      <button @click="getChat(chat)">{{ chat }}</button>
    </div>
    <br/>
    <!-- createChat -->
    <input v-model="chatName" placeholder="Chat name..." @keyup.enter="createChat" />
    <button @click="createChat">Create</button>
    <br/><br/>
    <!-- getChat -->
    <div>
      >> {{ currentChat }} <<
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { chatSocket } from '../getSocket'
import { get, post } from '../httpRequests'

const chatName = ref('')
const currentChat = ref('')
const chatsOnIndex = ref<string[]>([]);
const chatIdsOnIndex = ref<string[]>([]);
// const chatHistory = ref<string[]>([]);


async function createChat() {
  const chat = await post('chat/create', {
    name: chatName.value,
    visibility: 'PUBLIC'
  })
  console.log('chat', chat)
  getMyChats()
}

const myChats = ref('')

function getChat(chat: string) {
  currentChat.value = chat
  let i: number = 0
  let chat_id: string = ''

  while (chatsOnIndex.value[i]) {
    if (chatsOnIndex.value[i] == chat)
      chat_id = chatIdsOnIndex.value[i]
    i++
  }

  // chatHistory.value = []
  // history = await get()

  console.log("getChat is called on", chat, "with chat_id", chat_id)
}

async function getMyChats() {

  myChats.value = await get('user/myChats')
  console.log('myChats', myChats.value)
  let i: number = 0

  chatsOnIndex.value = []
  chatIdsOnIndex.value = []
  while (myChats.value[i]) {
    chatsOnIndex.value.push(myChats.value[i].name)
    chatIdsOnIndex.value.push(myChats.value[i].chat_id)
    i++;
  }
}

getMyChats()
</script>

<style scoped>
.chat-container {
  flex-grow: 1;
  position: relative;
}
</style>
