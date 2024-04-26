<template>
  <div>
    <!-- Chats -->
    <div>== CHATS ==</div>
    <div v-for="chat in chatsOnIndex">
      <button @click="getChat(chat)">{{ chat }}</button>
    </div>
    <br />
    <!-- createChat -->
    <input v-model="chatName" placeholder="Chat name..." @keyup.enter="createChat" />
    <button @click="createChat">Create</button>
    <br /><br />
    <!-- getChat -->
    <div>
      >> {{ currentChat }} << <div v-for="instance in chatHistory">
        {{ instance }}
    </div>
  </div>
  <input v-model="typedMessage" placeholder="Type message..." @keyup.enter="sendMessage" />
  <button @click="sendMessage">Send</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { chatSocket } from '../getSocket'
import { get, post } from '../httpRequests'

const chatName = ref('')
const currentChat = ref('')
const typedMessage = ref('')
const chatsOnIndex = ref<string[]>([]);
const chatIdsOnIndex = ref<string[]>([]);
const chatHistory = ref<string[]>([]);


async function createChat() {
  const chat = await post('chat/create', {
    name: chatName.value,
    visibility: 'PUBLIC',
    password: 'foo'
  })
  console.log('chat', chat)
  getMyChats()
}

const myChats = ref('')

async function getChat(chat: string) {
  currentChat.value = chat
  let i: number = 0
  let chat_id: string = ''
  let history: string[] = []

  while (chatsOnIndex.value[i]) {
    if (chatsOnIndex.value[i] == chat)
      chat_id = chatIdsOnIndex.value[i]
    i++
  }

  chatHistory.value = []
  console.log("test before get request chat/history")
  history = await get('chat/history/' + chat_id)
  console.log("test after get request chat/history")
  i = 0
  while (history[i]) {
    chatHistory.value[i] = history[i].sender + ': ' + history[i].body
    i++
  }
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

async function sendMessage() {

}

getMyChats()
</script>

<style scoped>
.chat-container {
  flex-grow: 1;
  position: relative;
}
</style>
