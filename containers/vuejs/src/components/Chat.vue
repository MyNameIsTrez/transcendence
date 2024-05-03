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
    <!-- addToChat -->
    <input v-model="newUser" placeholder="42 student..." @keyup.enter="addUser" />
    <button @click="addUser">Add</button>
    <br /><br />
    <!-- getChat -->
    <div>
      == {{ currentChat }} == <div v-for="instance in chatHistory">
        {{ instance }}
      </div>
    </div>
    <input v-model="typedMessage" placeholder="Type message..." @keyup.enter="sendMessage" />
    <button @click="sendMessage">Send</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { chatSocket } from '../getSocket'
import { get, post } from '../httpRequests'

const chatName = ref('')
const newUser = ref('')
const currentChat = ref('Select a chat')
const currentChatId = ref('')
const typedMessage = ref('')
const chatsOnIndex = ref<string[]>([]);
const chatIdsOnIndex = ref<string[]>([]);
const chatHistory = ref<string[]>([]);

async function addUser() {
  console.log("chat id: ", currentChatId.value, "username: ", newUser.value)
  const add_user = await post('chat/addUserToChat', {
    chat_id: currentChatId.value,
    username: newUser.value,
  })
  newUser.value = ''
}

async function createChat() {
  const chat = await post('chat/create', {
    name: chatName.value,
    visibility: 'PUBLIC',
    password: 'foo'
  })
  console.log('chat', chat)
  chatName.value = ''
  getMyChats()
}

const myChats = ref('')

async function getChat(chat: string) {
  currentChat.value = chat
  let i: number = 0
  let history: string[] = []

  while (chatsOnIndex.value[i]) {
    if (chatsOnIndex.value[i] == chat)
      currentChatId.value = chatIdsOnIndex.value[i]
    i++
  }

  chatHistory.value = []
  history = await get('chat/history/' + currentChatId.value)
  i = 0

  while (history[i]) {
    let intraId = history[i].sender;
    let user = await get('user/usernameOnIntraId/' + intraId)
    if (user) {
      chatHistory.value[i] = user + ': ' + history[i].body
      i++
    }
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

chatSocket.on('confirm', result => {
      typedMessage.value = ''
      getChat(currentChat.value)
})

async function sendMessage() {
  const message = {
    chatId: currentChatId.value,
    body: typedMessage.value
  }
  console.log('message', message)
  chatSocket.emit('sendMessage', message)
}

getMyChats()
</script>

<style scoped>
.chat-container {
  flex-grow: 1;
  position: relative;
}
</style>
