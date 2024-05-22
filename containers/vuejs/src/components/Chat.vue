<template>
  <div>
    <!-- Chats -->
    <button @click="changeChatButton"> {{ chatButtonText }} </button>
    <div v-if="chatButton">
      <div class="scrollable-container">
        <div
          v-for="(chat, index) in chatsOnIndex"
          :key="index"
          class="line"
          @click="validateLock(chat)"
          >
          {{ chat }}
        </div>
      </div>

      <!-- <div v-for="(chat) in chatsOnIndex">
        <button @click="getChat(chat)">{{ chat }}</button>
      </div> -->

      <br/><br/>
      when ref bool locked is true: insert text field for typing the password, when it's filled in correct open chat, set locked bool to false and hide text field again
      <br/><br/>

      <br/>
      <!-- createChat -->
      <input v-model="chatName" placeholder="Chat name..." @keyup.enter="createChat" />
      <button 
        :class= "privateButtonClass"
        @click="chatVisibility"> {{ visibility }}
      </button>
      <input v-if="protectedChat" v-model="passwordChat" placeholder="Password..." @keyup.enter="createChat" />
      <br/>
      <button @click="createChat">Create</button>
    </div>

    <div v-if="!chatButton && openChat">
      <div v-if="iAmAdmin">
        <br/>
        <button @click="changeOptionsButton"> {{ optionsButtonText }} </button>
        <br/><br/>
        <div v-if="optionsButton">
          <input v-model="otherUser" placeholder="42 student..." /><br/>
          <button @click="addUser">Add</button>
          <button @click="kickUser">/Kick</button>
          <button @click="banUser">/Ban</button>
          <button @click="addAdmin">/Make admin</button>
          <button @click="muteUser">/Mute</button>
          <input v-model="daysToMute" placeholder="days to mute..." />
          <br/><br/>
        </div>
      </div>
      <!-- admin operations -->
      <!-- joinChat -->
      <!-- <button @click="joinChat">Join chat</button>
      <br /><br /> -->
      <!-- getChat -->
      <button v-if="direct" @click="handleBlock"> {{ blockStatus }}</button>
      <br/>
      
      CURRENT CHAT: {{ currentChat }} <br/><br/>

      <div ref="chat" class="scrollable-container">
        <div
          v-for="(line, index) in chatHistory"
          :key="index"
          class="line"
          @click="handleLineClick(line)"
          >
          {{ line }}
        </div>
      </div>

      <input v-if="!iAmMute" v-model="typedMessage" placeholder="Type message..." @keyup.enter="sendMessage" />
      
      <button v-if="!iAmMute" @click="sendMessage">Send</button>
      </div>
    </div>
  <!-- </div> -->
</template>

<script setup lang="ts">
import { ref,} from 'vue'
import { chatSocket } from '../getSocket'
import { get, post } from '../httpRequests'
import { nextTick } from 'vue';

// VARIABLES
const myIntraId = ref('')
const allChats = ref('')
const myChats = ref('')
const chatName = ref('')
const otherUser = ref('')
const currentChat = ref('')
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
const otherIntraId = ref('')
const blockStatus = ref('Block')
const iAmBlocked = ref(false)
const daysToMute = ref('')
const chatButtonText = ref('== OPEN CHATS ==')
const chatButton = ref(false)
const optionsButtonText = ref('~ open options ~')
const optionsButton = ref(false)
const openChat = ref(false)
const text = ref('')
const chat = ref()
const locked = ref(false)

function handleLineClick(line: string) {
  console.log("line in handleLineClick:", line)
}

function changeOptionsButton() {
  optionsButton.value = !optionsButton.value
  if (optionsButton.value == false)
    optionsButtonText.value = "~ open options ~"
  else
    optionsButtonText.value = "~ close options ~"  
}

function changeChatButton() {
  chatButton.value = !chatButton.value
  if (chatButton.value == false) {
    chatButtonText.value = "== OPEN CHATS =="
    openChat.value = true
  }
  else {
    chatButtonText.value = "== CLOSE CHATS =="  
    openChat.value = false
  }
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
  const result = await get('chat/isAdmin/' + currentChatId.value + '/' + myIntraId.value)
  console.log("admin res", result)
  return result
}

async function isDirect() {
  const direct = await get('chat/isDirect/' + currentChatId.value)
  if (direct == true)
  return true
return false
}

async function isMuted(intra_id: string) {
  return await get('chat/isMute/' + currentChatId.value + '/' + intra_id)
}
async function isOwner() {
  const result = await get('chat/isOwner/' + currentChatId.value + '/' + myIntraId.value)
  console.log("owner res", result)
  return result
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

async function getInfo() {
  const info = await get('chat/info/' + currentChatId.value + '/' + myIntraId.value)
  iAmAdmin.value = info.isAdmin
  direct.value = info.isDirect
  iAmMute.value = info.isMute
  iAmOwner.value = info.isOwner
}

async function validateLock(chat_str: string) {
  currentChat.value = chat_str
  let i: number = 0

  while (chatsOnIndex.value[i]) {
    if (chatsOnIndex.value[i] == chat_str)
      currentChatId.value = chatIdsOnIndex.value[i]
    i++
  }
  if (await get('chat/isLocked/' + currentChatId.value)) {
    console.log("chat is locked");
    locked.value = true
  }
  else {
    console.log("chat is not locked");
    getChat(chat_str)
  }
}

async function getChat(chat_str: string) {
  currentChat.value = chat_str
  text.value = ''
  let i: number = 0
  let history: string[] = []
  if (openChat.value == false)
    changeChatButton()

  while (chatsOnIndex.value[i]) {
    if (chatsOnIndex.value[i] == chat_str)
      currentChatId.value = chatIdsOnIndex.value[i]
    i++
  }

  await getInfo()
  if (direct.value) {
    otherIntraId.value = await getOtherIntraId()
    iAmBlocked.value = await getBlockStatus()
  }
  else {
    otherIntraId.value = ''
    iAmBlocked.value = false
  }
  
  chatHistory.value = []
  history = await get('chat/history/' + currentChatId.value)
  
  i = 0
  while (history[i]) {
    chatHistory.value[i] = history[i].sender_name + ': ' + history[i].body + '\n'
    i++
  }
  
  await nextTick();

  chat.value.scrollTop = chat.value.scrollHeight;
}

// onMounted(() => {
//   console.log("onMounted") // <div>
//   chat.value.scrollTop = chat.value.scrollHeight
// })

// async function joinChat() {
//   // TODO: Replace this hardcoded chat_id and password
//   const chat_id = '36c54d23-7c33-4f0d-ab82-7b1582ba0e3c'
//   const password = 'foo'

//   const joined = await post('chat/join', { chat_id, password })
//   console.log('joined', joined)
// }

async function getMyChats() {
  myChats.value = await get('user/myChats')
  let i: number = 0
  chatsOnIndex.value = []
  chatIdsOnIndex.value = []

  while (myChats.value[i]) {
    chatsOnIndex.value.push(myChats.value[i].name)
    chatIdsOnIndex.value.push(myChats.value[i].chat_id)
    i++
  }
}

chatSocket.on('confirm', async result => {
  typedMessage.value = ''
  await getChat(currentChat.value)
})

function sendMessage() {
  if ((direct.value && iAmBlocked.value) || iAmMute.value) {
    typedMessage.value = ''
    return
  }
  const message = {
    chatId: currentChatId.value,
    body: typedMessage.value
  }
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
.scrollable-container {
  width: 100%;
  height: 1000px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  overflow-y: auto;
  word-break: break-all;
}

.line {
  width: 100%;
  padding: 5px;
  cursor: pointer;
  user-select: none; /* Prevent text selection */
}

.line:hover {
  background-color: hsl(0, 0%, 30%); /* Highlight on hover */
}
</style>
