<template>
  <div>
    <!-- Chats -->
    <button @click="changeChatButton"> {{ chatButtonText }} </button>
    <div v-if="chatButton">
      <div v-for="chat in chatsOnIndex">
        <button @click="getChat(chat)">{{ chat }}</button>
      </div>
      <br/>
      <!-- createChat -->
      <input v-model="chatName" placeholder="Chat name..." @keyup.enter="createChat" />
      <button 
        :class= "privateButtonClass"
        @click="chatVisibility"> {{ visibility }}
      </button>
      <input v-if="protectedChat && isOwner" v-model="passwordChat" placeholder="Password..." @keyup.enter="createChat" />
      <br/>
      <button @click="createChat">Create</button>
    </div>

    <div v-if="!chatButton && openChat">
      <br/>
      <button @click="changeOptionsButton"> {{ optionsButtonText }} </button>
      <br/><br/>
      <div v-if="iAmAdmin && optionsButton">
      <input v-model="otherUser" placeholder="42 student..." />
      <button @click="addUser">Add</button>
      <button @click="kickUser">/Kick</button>
      <button @click="banUser">/Ban</button>
      <button @click="addAdmin">/Make admin</button>
      <button @click="muteUser">/Mute</button>
      <input v-model="daysToMute" placeholder="days to mute..." />
      <br/><br/>
      </div>
      <!-- admin operations -->
      <!-- joinChat -->
      <!-- <button @click="joinChat">Join chat</button>
      <br /><br /> -->
      <!-- getChat -->
      <button v-if="direct" @click="handleBlock"> {{ blockStatus }}</button>
      <div>
        == {{ currentChat }} == <div v-for="instance in chatHistory">
          {{ instance }}
        </div>
      </div>
      <input v-if="!iAmMute" v-model="typedMessage" placeholder="Type message..." @keyup.enter="sendMessage" />
      <button v-if="!iAmMute" @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { chatSocket } from '../getSocket'
import { get, post } from '../httpRequests'

// VARIABLES
const myIntraId = ref('')
const allChats = ref('')
const myChats = ref('')
const chatName = ref('')
const otherUser = ref('')
const currentChat = ref('Select a chat')
const currentChatId = ref('')
const typedMessage = ref('')
const chatsOnIndex = ref<string[]>([]);
const chatIdsOnIndex = ref<string[]>([]);
const chatHistory = ref<string[]>([]);
const privateButtonClass = ref('btn btn-warning text-white mx-3 mb-3')
const visibility = ref('PUBLIC')
const visibilityNum = ref(1)
const protectedChat = ref(false)
const passwordChat = ref('')
const iAmAdmin = ref(false)
const iAmOwner = ref(false)
const iAmMute = ref(false)
const direct = ref(false)
const otherIntraId = ref(0)
const blockStatus = ref('Block')
const iAmBlocked = ref(false)
const daysToMute = ref('')
const chatButtonText = ref('== OPEN CHATS ==')
const chatButton = ref(false)
const optionsButtonText = ref('~ open options ~')
const optionsButton = ref(false)
const openChat = ref(false)

function changeOpenChat() {
  openChat.value = !openChat.value
}

function changeOptionsButton() {
  optionsButton.value = !optionsButton.value
  if (optionsButton.value == false)
    optionsButtonText.value = "~ open options ~"
  else
    optionsButtonText.value = "~ close options ~"  
}

function changeChatButton() {
  changeOpenChat()
  chatButton.value = !chatButton.value
  if (chatButton.value == false)
    chatButtonText.value = "== OPEN CHATS =="
  else
    chatButtonText.value = "== CLOSE CHATS =="  
}

async function isMuted(intra_id: string) {
  return await get('chat/iAmMute/' + currentChatId.value + '/' + intra_id)
}

async function muteUser() {
  const mute = await post('chat/mute', {
    chat_id: currentChatId.value,
    username: otherUser.value,
    days: daysToMute.value
  })
  console.log("mute", mute)
  daysToMute.value = ''
}

async function getBlockStatus() {
  return await get('user/blockStatus/' + myIntraId.value + '/' + otherIntraId.value)
}

async function getMyIntraId() {
  myIntraId.value = await get('user/intraId')
}

async function getOtherIntraId() {
  return await get('chat/getOtherIntraId/' + currentChatId.value + '/' + myIntraId.value)
}

async function handleBlock() {
  if (blockStatus.value == 'Block') {
    blockUser()
    blockStatus.value = 'Deblock'
  }
  else {
    deblockUser()
    blockStatus.value = 'Block'
  }
}

async function blockUser() {
  const result = await get('user/block/' + myIntraId.value + '/' + otherIntraId.value)
}

async function deblockUser() {
  const result = await get('user/deblock/' + myIntraId.value + '/' + otherIntraId.value)
}

async function kickUser() {
  const result = await get('chat/kick/' + currentChatId.value + '/' + otherUser.value)
  otherUser.value = ''
  getChat(currentChat.value)
}

async function banUser() {
  const result = await get('chat/ban/' + currentChatId.value + '/' + otherUser.value)
  otherUser.value = ''
}

async function addAdmin() {
  if (iAmAdmin.value == false) {
    console.log("No admin authorization")
    return 
  }
  console.log("You are admin")
  const addAdmin = await post('chat/addAdminToChat', {
    chat_id: currentChatId.value,
    username: otherUser.value,
  })
  otherUser.value = ''

}

async function isAdmin() {
  const admins = await get('chat/getAdmins/' + currentChatId.value)
  
  let i: number = 0
  console.log(admins)
  while (admins[i]) {
    if (admins[i].intra_id == myIntraId.value)
      return true
    i++;
  }
  return false
}

async function isDirect() {
  const direct = await get('chat/isDirect/' + currentChatId.value)
  if (direct == true)
    return true
  return false
}

async function isOwner() {
  const owner = await get('chat/getOwner/' + currentChatId.value)
  if (myIntraId.value == owner)
    return true
  return false
}

async function addUser() {
  const add_user = await post('chat/addUserToChat', {
    chat_id: currentChatId.value,
    username: otherUser.value,
  })
  otherUser.value = ''
  getChat(currentChat.value)
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
  changeChatButton()
  changeOpenChat()

  while (chatsOnIndex.value[i]) {
    if (chatsOnIndex.value[i] == chat)
      currentChatId.value = chatIdsOnIndex.value[i]
    i++
  }

  iAmAdmin.value = await isAdmin()
  iAmOwner.value = await isOwner()
  direct.value = await isDirect()
  if (direct.value)
    otherIntraId.value = await getOtherIntraId()
  else
    otherIntraId.value = 0
  iAmBlocked.value = await getBlockStatus()
  iAmMute.value = await isMuted(myIntraId.value)
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
  if ((direct.value && iAmBlocked.value) || iAmMute.value) {
    typedMessage.value = ''
    return
  }
  const message = {
    chatId: currentChatId.value,
    body: typedMessage.value
  }
  console.log('message', message)
  chatSocket.emit('sendMessage', message)
}

function chatVisibility() {
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

getMyIntraId()
getMyChats()
</script>

<style scoped>
.chat-container {
  flex-grow: 1;
  position: relative;
}
</style>
