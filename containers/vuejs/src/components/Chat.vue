<template>
  <div>
    <!-- My chats -->
    <div>== MY CHATS ==</div>
    <div v-for="chat in chatsOnIndex">
      <button @click="getChat(chat)">{{ chat }}</button>
    </div>
    <br />
    <!-- createChat -->
    <input v-model="chatName" placeholder="Chat name..." @keyup.enter="createChat" />
    <button 
      :class= "privateButtonClass"
      @click="privateChat"> {{ visibility }}
    </button>
    <input v-if="protectedChat && isOwner" v-model="passwordChat" placeholder="Password..." @keyup.enter="createChat" />
    <br/>
    <button @click="createChat">Create</button>
    <div v-if="iAmAdmin">
      <br/>
    </div>
    <!-- addToChat -->
    <input v-if="iAmAdmin" v-model="newUser" placeholder="42 student..." />
    <button v-if="iAmAdmin" @click="addUser">Add</button>
    <button v-if="iAmAdmin" @click="kickUser">/Kick</button>
    <button v-if="iAmAdmin" @click="banUser">/Ban</button>
    <button v-if="iAmAdmin" @click="muteUser">/Mute</button>
    <button v-if="iAmAdmin" @click="addAdmin">/Make admin</button>
    <br /><br />

    <!-- joinChat -->
    <!-- <button @click="joinChat">Join chat</button>
    <br /><br /> -->
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

// VARIABLES
const allChats = ref('')
const myChats = ref('')
const chatName = ref('')
const newUser = ref('')
const currentChat = ref('Select a chat')
const currentChatId = ref('')
const typedMessage = ref('')
const chatsOnIndex = ref<string[]>([]);
const chatIdsOnIndex = ref<string[]>([]);
const chatHistory = ref<string[]>([]);
const privateButtonClass = ref('btn btn-warning text-white mx-3 mb-3')
const visibility = ref('PUBLIC')
const visibilityNum = ref<number>(1)
const protectedChat = ref(false)
const passwordChat = ref<string>('')
const iAmAdmin = ref(false)
const iAmOwner = ref(false)

async function addAdmin() {
  if (iAmAdmin.value == false) {
    console.log("No admin authorization")
    return 
  }
  console.log("You are admin")
  const addAdmin = await post('chat/addAdminToChat', {
    chat_id: currentChatId.value,
    username: newUser.value,
  })
  newUser.value = ''

}

async function isAdmin() {
  const intraId = await get('user/intraId')
  const admins = await get('chat/getAdmins/' + currentChatId.value)
  
  let i: number = 0
  console.log(admins)
  while (admins[i]) {
    if (admins[i].intra_id == intraId)
      return true
    i++;
  }
  return false
}

async function isOwner() {
  const intraId = await get('user/intraId')
  const owner = await get('chat/getOwner/' + currentChatId.value)
  if (intraId == owner)
    return true
  return false
}

async function addUser() {
  console.log("chat id: ", currentChatId.value, "username: ", newUser.value)
  const add_user = await post('chat/addUserToChat', {
    chat_id: currentChatId.value,
    username: newUser.value,
  })
  newUser.value = ''
}

async function createChat() {
  if (passwordChat.value == '')
    passwordChat.value = 'foo'
  console.log("password", passwordChat.value)
  const chat = await post('chat/create', {
    name: chatName.value,
    visibility: visibility.value,
    password: passwordChat.value
  })
  console.log('chat', chat)
  passwordChat.value = ''
  chatName.value = ''
  getMyChats()
}

async function getChat(chat: string) {
  currentChat.value = chat
  let i: number = 0
  let history: string[] = []

  while (chatsOnIndex.value[i]) {
    if (chatsOnIndex.value[i] == chat)
      currentChatId.value = chatIdsOnIndex.value[i]
    i++
  }

  iAmAdmin.value = isAdmin()
  iAmOwner.value = isOwner()
  console.log("i am owner", iAmOwner.value)
  console.log("i am admin", iAmAdmin.value)

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

// async function joinChat() {
//   // TODO: Replace this hardcoded chat_id and password
//   const chat_id = '36c54d23-7c33-4f0d-ab82-7b1582ba0e3c'
//   const password = 'foo'

//   const joined = await post('chat/join', { chat_id, password })
//   console.log('joined', joined)
// }

async function getMyChats() {
  myChats.value = await get('user/myChats')
  console.log('myChats', myChats.value)
  let i: number = 0
  chatsOnIndex.value = []
  chatIdsOnIndex.value = []

  while (myChats.value[i]) {
    chatsOnIndex.value.push(myChats.value[i].name)
    chatIdsOnIndex.value.push(myChats.value[i].chat_id)
    i++
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

function privateChat() {
  protectedChat.value = false
  visibilityNum.value += 1
  if (visibilityNum.value > 3)
    visibilityNum.value = 1
  if (visibilityNum.value == 1) {
    privateButtonClass.value = "btn btn-warning mb-3"
    visibility.value = 'PUBLIC'
  }
  else if (visibilityNum.value == 2) {
    privateButtonClass.value = "btn btn-primary mx-3 mb-3"
    visibility.value = 'PRIVATE'
  }
  else {
    privateButtonClass.value = "btn btn-info mx-6 mb-3"
    visibility.value = 'PROTECTED'
    protectedChat.value = true
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
